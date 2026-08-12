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
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          Dados do produto
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Especificações
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-8">
            <p className="text-sm font-medium text-slate-500">
              Carregando especificações...
            </p>
          </div>
        ) : especificacoes.length === 0 ? (
          <div className="px-6 py-8">
            <p className="text-sm text-slate-500">
              Nenhuma especificação disponível.
            </p>
          </div>
        ) : (
          <dl className="divide-y divide-slate-100">
            {especificacoesVisiveis.map((item, index) => (
              <div
                key={`${item.label}-${item.value}-${index}`}
                className="grid grid-cols-1 gap-2 px-6 py-4 sm:grid-cols-[minmax(11rem,0.8fr)_minmax(0,1.7fr)] sm:items-start sm:gap-8"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {item.label}
                </dt>

                <dd className="min-w-0 break-words whitespace-normal text-sm font-medium leading-6 text-slate-800 sm:text-right">
                  {String(item.value ?? "—")}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {!loading && podeExpandir && (
          <div className="border-t border-slate-100 px-6 py-4 text-center">
            <button
              type="button"
              onClick={() => setMostrarTodas((old) => !old)}
              className="text-sm font-semibold text-violet-600 transition hover:text-violet-700"
            >
              {mostrarTodas
                ? "Ver menos especificações"
                : "Ver todas as especificações"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
