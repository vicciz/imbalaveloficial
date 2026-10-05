import "server-only";

import { after } from "next/server";
import { getSupabaseAdminClient } from "@/src/services/products/repository/adminSupabase";

export type UsdBrlQuote = {
  rate: number;
  bid: number | null;
  ask: number | null;
  timestamp: number | null;
  source: "awesomeapi" | "fallback";
};

const API_URL =
  "https://economia.awesomeapi.com.br/json/last/USD-BRL";
const CACHE_KEY = "USD/BRL";
const CACHE_TTL_MS = 30 * 60 * 1000;
const AWESOME_API_TIMEOUT_MS = 8_000;

let cached: { value: UsdBrlQuote; expiresAt: number } | null = null;
let pending: Promise<UsdBrlQuote> | null = null;

type StoredUsdBrlQuote = {
  currency_pair: string;
  rate: number | string;
  bid: number | string | null;
  ask: number | string | null;
  quote_timestamp: number | string | null;
  source: "awesomeapi" | "fallback";
  updated_at: string;
};

type CurrencyCachePayload = {
  currency_pair: string;
  rate: number;
  bid: number | null;
  ask: number | null;
  quote_timestamp: number | null;
  source: "awesomeapi" | "fallback";
  updated_at: string;
};

type CurrencyCacheClient = {
  from: (table: "cotacao_cambio_cache") => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{
          data: StoredUsdBrlQuote | null;
          error: { message: string } | null;
        }>;
      };
    };
    upsert: (
      value: CurrencyCachePayload,
      options: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  };
};

function getCurrencyCacheClient() {
  return getSupabaseAdminClient() as unknown as CurrencyCacheClient;
}

function numeroPositivo(value: unknown): number | null {
  const numero = Number(value);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function criarCacheLocal(value: UsdBrlQuote) {
  cached = {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  return value;
}

function converterCotacaoArmazenada(
  row: StoredUsdBrlQuote
): { quote: UsdBrlQuote; expiresAt: number } | null {
  const rate = numeroPositivo(row.rate);
  const updatedAt = Date.parse(row.updated_at);

  if (!rate || !Number.isFinite(updatedAt)) return null;

  return {
    quote: {
      rate,
      bid: numeroPositivo(row.bid),
      ask: numeroPositivo(row.ask),
      timestamp: Number.isFinite(Number(row.quote_timestamp))
        ? Number(row.quote_timestamp)
        : null,
      source: row.source === "fallback" ? "fallback" : "awesomeapi",
    },
    expiresAt: updatedAt + CACHE_TTL_MS,
  };
}

async function lerUltimaCotacaoValida() {
  try {
    const { data, error } = await getCurrencyCacheClient()
      .from("cotacao_cambio_cache")
      .select("currency_pair, rate, bid, ask, quote_timestamp, source, updated_at")
      .eq("currency_pair", CACHE_KEY)
      .maybeSingle();

    if (error) {
      console.warn("[USD/BRL] Não foi possível ler o cache persistente.", {
        error: error.message,
      });
      return null;
    }

    return data
      ? converterCotacaoArmazenada(data as StoredUsdBrlQuote)
      : null;
  } catch (error) {
    console.warn("[USD/BRL] Não foi possível acessar o cache persistente.", {
      error: error instanceof Error ? error.message : "Erro desconhecido.",
    });
    return null;
  }
}

async function salvarCotacao(value: UsdBrlQuote) {
  try {
    const { error } = await getCurrencyCacheClient()
      .from("cotacao_cambio_cache")
      .upsert(
        {
          currency_pair: CACHE_KEY,
          rate: value.rate,
          bid: value.bid,
          ask: value.ask,
          quote_timestamp: value.timestamp,
          source: value.source,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "currency_pair" }
      );

    if (error) {
      console.warn("[USD/BRL] Cotação obtida, mas não foi possível atualizar o cache persistente.", {
        error: error.message,
      });
    }
  } catch (error) {
    console.warn("[USD/BRL] Cotação obtida, mas o cache persistente está indisponível.", {
      error: error instanceof Error ? error.message : "Erro desconhecido.",
    });
  }
}

async function buscarCotacaoAwesomeApi(): Promise<UsdBrlQuote> {
  const apiKey = process.env.AWESOME_API_KEY?.trim();
  const url = apiKey
    ? `${API_URL}?token=${encodeURIComponent(apiKey)}`
    : API_URL;

  const response = await fetch(url, {
    headers: apiKey ? { "x-api-key": apiKey } : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(AWESOME_API_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`AwesomeAPI retornou ${response.status}`);
  }

  const json = await response.json();
  const quote = json?.USDBRL;
  const bid = numeroPositivo(quote?.bid);
  const ask = numeroPositivo(quote?.ask);
  const rate = ask ?? bid;

  if (!rate) {
    throw new Error("Cotação USD/BRL inválida.");
  }

  return {
    rate,
    bid,
    ask,
    timestamp: Number.isFinite(Number(quote?.timestamp))
      ? Number(quote.timestamp)
      : null,
    source: "awesomeapi",
  };
}

export async function getUsdBrlRate(): Promise<UsdBrlQuote> {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  if (pending) return pending;

  pending = (async () => {
    const ultimaCotacao = await lerUltimaCotacaoValida();

    if (ultimaCotacao && ultimaCotacao.expiresAt > Date.now()) {
      return criarCacheLocal(ultimaCotacao.quote);
    }

    try {
      const value = await buscarCotacaoAwesomeApi();
      after(() => salvarCotacao(value));
      console.info("[USD/BRL] Cotação atualizada pela AwesomeAPI.", {
        timestamp: value.timestamp,
      });
      return criarCacheLocal(value);
    } catch (error) {
      if (ultimaCotacao) {
        console.warn("[USD/BRL] Falha ao atualizar na AwesomeAPI; usando a última cotação válida.", {
          error: error instanceof Error ? error.message : "Erro desconhecido.",
        });
        return criarCacheLocal(ultimaCotacao.quote);
      }

      const fallback = numeroPositivo(process.env.USD_BRL_RATE);

      if (fallback) {
        const value: UsdBrlQuote = {
          rate: fallback,
          bid: null,
          ask: null,
          timestamp: null,
          source: "fallback",
        };
        after(() => salvarCotacao(value));
        console.warn("[USD/BRL] AwesomeAPI indisponível; usando o fallback inicial configurado.", {
          error: error instanceof Error ? error.message : "Erro desconhecido.",
        });
        return criarCacheLocal(value);
      }

      throw new Error(
        "Cotação USD/BRL indisponível. A AwesomeAPI falhou e USD_BRL_RATE não está configurada ou é inválida."
      );
    }
  })();

  try {
    return await pending;
  } finally {
    pending = null;
  }
}
