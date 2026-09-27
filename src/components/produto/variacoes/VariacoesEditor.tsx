"use client";

import { useEffect, useMemo, useState } from "react";

import CardVariacao from "./CardVariacao";
import { VariacoesEditorProps } from "./types";
import { salvarStatusVariacao } from "@/src/components/produto/types/variacoes";

function variationIsActive(variacao: any): boolean {
  return (variacao?.produto_variacao_item ?? []).some((item: any) => item?.ativo);
}

function getVariationAttributeValue(variacao: any, attributeName: string): string | null {
  const item = (variacao?.produto_variacao_item ?? []).find(
    (entry: any) => entry?.variacao_valor?.variacao_tipo?.nome === attributeName
  );

  return item?.variacao_valor?.valor ?? null;
}

export default function VariacoesEditor({
  produto,
  variacoes,
  imagens,
  onRefresh,
}: VariacoesEditorProps) {
  const isCjProduct = produto.origem?.toLowerCase() === "cj";
  const [usdBrlQuote, setUsdBrlQuote] = useState<{
    rate: number;
    source: "awesomeapi" | "fallback";
    updatedAt: string;
  } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [atributoControle, setAtributoControle] = useState<string>("");
  const [valoresDisponiveis, setValoresDisponiveis] = useState<string[]>([]);
  const [salvandoDisponibilidade, setSalvandoDisponibilidade] = useState(false);

  useEffect(() => {
    if (!isCjProduct) {
      setUsdBrlQuote(null);
      return;
    }

    let active = true;
    setQuoteLoading(true);

    fetch("/api/cambio/usd-brl", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Cotação USD/BRL indisponível.");
        }

        return response.json() as Promise<{
          rate?: number;
          source?: "awesomeapi" | "fallback";
          updatedAt?: string;
        }>;
      })
      .then((quote) => {
        if (!Number.isFinite(quote.rate) || !quote.rate || quote.rate <= 0) {
          throw new Error("Cotação USD/BRL inválida.");
        }

        if (active) {
          setUsdBrlQuote({
            rate: quote.rate,
            source: quote.source === "fallback" ? "fallback" : "awesomeapi",
            updatedAt: quote.updatedAt ?? new Date().toISOString(),
          });
        }
      })
      .catch(() => {
        if (active) {
          setUsdBrlQuote(null);
        }
      })
      .finally(() => {
        if (active) {
          setQuoteLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isCjProduct]);

  const atributos = useMemo(() => {
    const mapa = new Map<string, Set<string>>();

    for (const variacao of variacoes) {
      for (const item of variacao.produto_variacao_item ?? []) {
        const nome = item?.variacao_valor?.variacao_tipo?.nome;
        const valor = item?.variacao_valor?.valor;

        if (!nome || !valor) {
          continue;
        }

        if (!mapa.has(nome)) {
          mapa.set(nome, new Set<string>());
        }

        mapa.get(nome)?.add(valor);
      }
    }

    return Array.from(mapa.entries()).map(([nome, values]) => ({
      nome,
      valores: Array.from(values).sort(),
    }));
  }, [variacoes]);

  useEffect(() => {
    if (atributos.length === 0) {
      setAtributoControle("");
      setValoresDisponiveis([]);
      return;
    }

    const preferido = atributos.find((atributo) => atributo.nome.toLowerCase() === "cor");
    const atualExiste = atributos.some((atributo) => atributo.nome === atributoControle);

    if (!atributoControle || !atualExiste) {
      setAtributoControle(preferido?.nome ?? atributos[0].nome);
    }
  }, [atributoControle, atributos]);

  useEffect(() => {
    if (!atributoControle) {
      setValoresDisponiveis([]);
      return;
    }

    const valoresAtivos = new Set<string>();

    for (const variacao of variacoes) {
      const valor = getVariationAttributeValue(variacao, atributoControle);

      if (!valor) {
        continue;
      }

      if (variationIsActive(variacao)) {
        valoresAtivos.add(valor);
      }
    }

    setValoresDisponiveis(Array.from(valoresAtivos));
  }, [atributoControle, variacoes]);

  const valoresDoAtributo = useMemo(() => {
    const atributo = atributos.find((item) => item.nome === atributoControle);
    return atributo?.valores ?? [];
  }, [atributoControle, atributos]);

  function toggleValorDisponivel(valor: string): void {
    setValoresDisponiveis((current) =>
      current.includes(valor)
        ? current.filter((item) => item !== valor)
        : [...current, valor]
    );
  }

  async function aplicarDisponibilidade(): Promise<void> {
    if (!atributoControle) {
      return;
    }

    setSalvandoDisponibilidade(true);

    try {
      const permitidos = new Set(valoresDisponiveis);
      const updates: Promise<any>[] = [];

      for (const variacao of variacoes) {
        const valor = getVariationAttributeValue(variacao, atributoControle);

        if (!valor) {
          continue;
        }

        const ativoAtual = variationIsActive(variacao);
        const deveFicarAtivo = permitidos.has(valor);

        if (ativoAtual === deveFicarAtivo) {
          continue;
        }

        updates.push(salvarStatusVariacao(variacao.id, deveFicarAtivo));
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      await onRefresh();
    } finally {
      setSalvandoDisponibilidade(false);
    }
  }

  if (
    !produto.produto_variacao?.length
  ) {
    return null;
  }

return (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">
        Variações
      </h2>

      <p className="text-muted-foreground">
        Cada variação possui seu próprio estoque,
        preço e imagens.
      </p>

      {isCjProduct && (
        <p className="mt-2 text-sm text-slate-600" aria-live="polite">
          Cotação utilizada: {usdBrlQuote
            ? `US$ 1 = ${new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              }).format(usdBrlQuote.rate)} (${usdBrlQuote.source === "fallback" ? "configuração local" : "AwesomeAPI"}, ${new Date(usdBrlQuote.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})`
            : quoteLoading
              ? "carregando..."
              : "indisponível"}
        </p>
      )}
    </div>

    {atributos.length > 0 && (
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          Disponibilidade por atributo
        </h3>

        <p className="mt-2 text-sm text-slate-600">
          Selecione os valores que devem permanecer disponíveis para compra.
        </p>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="w-full md:max-w-xs">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Atributo
            </label>

            <select
              value={atributoControle}
              onChange={(event) => setAtributoControle(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            >
              {atributos.map((atributo) => (
                <option key={atributo.nome} value={atributo.nome}>
                  {atributo.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setValoresDisponiveis(valoresDoAtributo)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              Marcar todos
            </button>

            <button
              type="button"
              onClick={() => setValoresDisponiveis([])}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {valoresDoAtributo.map((valor) => {
            const ativo = valoresDisponiveis.includes(valor);

            return (
              <button
                key={valor}
                type="button"
                onClick={() => toggleValorDisponivel(valor)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  ativo
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {valor}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={aplicarDisponibilidade}
            disabled={salvandoDisponibilidade}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {salvandoDisponibilidade ? "Aplicando..." : "Aplicar disponibilidade"}
          </button>
        </div>
      </section>
    )}

    {variacoes.map((variacao) => (
      <CardVariacao
        key={variacao.id}
        produto={produto}
        variacao={variacao}
        imagens={imagens}
        usdBrlRate={usdBrlQuote?.rate ?? null}
        onRefresh={onRefresh}
      />
    ))}
  </div>
);
}