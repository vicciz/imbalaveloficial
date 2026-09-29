"use client";

import CjProductCard from "./CjProductCard";
import type { CJProduct } from "./types";

type Props = {
  produtos: CJProduct[];
  onImport: (produto: CJProduct) => void;
};

export default function CjProductGrid({
  produtos,
  onImport,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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