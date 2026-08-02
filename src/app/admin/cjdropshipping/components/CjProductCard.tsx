"use client";

import { Button } from "@/src/components/ui/button";

import { CJProduct } from "./types";

type Props = {
  produto: CJProduct;

  onImport: (
    produto: CJProduct
  ) => void;
};

export default function CjProductCard({
  produto,
  onImport,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">

      <img
        src={produto.bigImage}
        alt={produto.nameEn}
        className="h-56 w-full rounded-lg object-cover"
      />

      <h2 className="mt-3 line-clamp-2 font-semibold">
        {produto.nameEn}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        SKU:
        {" "}
        {produto.sku ?? "-"}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {produto.supplierName ?? ""}
      </p>

      <p className="mt-3 text-xl font-bold text-violet-700">
        US$
        {" "}
        {produto.sellPrice}
      </p>

      <Button
        className="mt-4 w-full"
        onClick={() =>
          onImport(produto)
        }
      >
        Importar
      </Button>

    </div>
  );
}