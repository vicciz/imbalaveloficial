"use client";

import { useMemo, useState } from "react";
import { Produto } from "@/src/components/produto/types/produtos";
import { useProdutoEspecificacoes } from "@/src/hooks/produto/useProdutoEspecificacoes";

type Props = {
  produto: Produto;
};

export default function ProductSpecification({ produto }: Props) {
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const { loading, grupos } = useProdutoEspecificacoes(produto.id);

  const especificacoes = useMemo(() => {
    return grupos.flatMap((grupo) =>
      grupo.itens.map((item) => ({
        label: item.nome,
        value: item.valor,
      }))
    );
  }, [grupos]);

  const LIMITE_PRINCIPAIS = 6;

  const especificacoesVisiveis = mostrarTodas
    ? especificacoes
    : especificacoes.slice(0, LIMITE_PRINCIPAIS);

  const podeExpandir = especificacoes.length > LIMITE_PRINCIPAIS;

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-semibold text-slate-900">
        Especificações
      </h2>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        {loading ? (
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Carregando especificações...
          </p>
        ) : (
        <dl className="space-y-4">
          {especificacoesVisiveis.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <dt className="text-sm font-medium uppercase tracking-wide text-slate-500">
                {item.label}
              </dt>
              <dd className="text-sm font-semibold text-slate-800">
                {item.value as any}
              </dd>
            </div>
          ))}
        </dl>
        )}

        {!loading && podeExpandir && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setMostrarTodas((old) => !old)}
              className="text-sm font-semibold text-violet-600 transition hover:text-violet-700"
            >
              {mostrarTodas ? "Ver menos especificações" : "Ver todas as especificações"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
