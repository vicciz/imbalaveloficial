"use client";

import { Produto } from "@/src/components/produto/types/produtos";

type Props = {
  produto: Produto;
};

export default function ProductApresentation({
  produto,
}: Props) {
  const apresentacaoCompleta =
    produto.detalhes ||
    "Apresentação não disponível.";

  return (
    <section>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-semibold text-slate-900">
          Apresentação do Produto
        </h2>

        <div className="mt-6 space-y-4 text-slate-700">
          <p className="whitespace-pre-line">{apresentacaoCompleta}</p>
        </div>
      </div>
    </section>
  );
}
