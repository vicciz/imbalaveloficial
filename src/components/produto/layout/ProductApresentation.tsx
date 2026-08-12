"use client";

import ProductDescription from "@/src/components/product/ProductDescription";
import { Produto } from "@/src/components/produto/types/produtos";

type Props = {
  produto: Produto;
};

export default function ProductApresentation({ produto }: Props) {
  const apresentacaoCompleta =
    produto.detalhes || "Apresentação não disponível.";

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          Sobre o produto
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Apresentação do Produto
        </h2>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8 sm:py-8">
        <ProductDescription
          html={apresentacaoCompleta}
          className="text-[15px] sm:text-base"
        />
      </div>
    </section>
  );
}
