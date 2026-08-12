export type UsdBrlQuote = {
  rate: number;
  bid: number | null;
  ask: number | null;
  timestamp: number | null;
  source: "awesomeapi" | "fallback";
};

const API_URL =
  "https://economia.awesomeapi.com.br/json/last/USD-BRL";

let cached: { value: UsdBrlQuote; expiresAt: number } | null = null;
let pending: Promise<UsdBrlQuote> | null = null;

export async function getUsdBrlRate(): Promise<UsdBrlQuote> {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  if (pending) return pending;

  pending = (async () => {
    try {
      const apiKey = process.env.AWESOME_API_KEY?.trim();
      const url = apiKey
        ? `${API_URL}?token=${encodeURIComponent(apiKey)}`
        : API_URL;

      const response = await fetch(url, {
        headers: apiKey ? { "x-api-key": apiKey } : undefined,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`AwesomeAPI retornou ${response.status}`);
      }

      const json = await response.json();
      const quote = json?.USDBRL;

      // Use ask as the conservative conversion from USD cost to BRL.
      const bid = Number(quote?.bid);
      const ask = Number(quote?.ask);
      const rate = Number.isFinite(ask) && ask > 0
        ? ask
        : Number.isFinite(bid) && bid > 0
          ? bid
          : NaN;

      if (!Number.isFinite(rate) || rate <= 0) {
        throw new Error("Cotação USD/BRL inválida.");
      }

      const value: UsdBrlQuote = {
        rate,
        bid: Number.isFinite(bid) ? bid : null,
        ask: Number.isFinite(ask) ? ask : null,
        timestamp: Number.isFinite(Number(quote?.timestamp))
          ? Number(quote.timestamp)
          : null,
        source: "awesomeapi",
      };

      // Short cache prevents excessive upstream calls while staying near-real-time.
      cached = {
        value,
        expiresAt: Date.now() + 30_000,
      };

      return value;
    } catch (error) {
      const fallback = Number(process.env.USD_BRL_RATE ?? 0);

      if (Number.isFinite(fallback) && fallback > 0) {
        return {
          rate: fallback,
          bid: null,
          ask: null,
          timestamp: null,
          source: "fallback",
        };
      }

      throw error;
    }
  })();

  try {
    return await pending;
  } finally {
    pending = null;
  }
}
