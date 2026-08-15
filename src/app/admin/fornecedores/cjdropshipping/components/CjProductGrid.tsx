"use client";

import { CJProduct } from "./types";

import CjProductCard from "./CjProductCard";

type Props = {
  produtos: CJProduct[];

  onImport: (
    produto: CJProduct
  ) => void;
};

export default function CjProductGrid({
  produtos,
  onImport,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {produtos.map((produto) => (

        <CjProductCard
          key={produto.id}
          produto={produto}
          onImport={onImport}
        />

      ))}

    </div>
  );
}