"use client";

import Link from "next/link";
import HomeProductCard from "../Vitrines/componentes/HomeProductCard";

import type { Produto } from "@/src/services/produto/produtos";

type Props = {
  titulo: string;
  produtos: Produto[];
};

export default function ProductSection({
  titulo,
  produtos,
}: Props) {
  if (!produtos.length) return null;

  return (
    <section
      className="
        mt-10
        mb-14
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-6
        shadow-sm
      "
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">
          {titulo}
        </h2>

        <Link
          href="#"
          className="
            text-sm
            font-medium
            text-violet-600
            hover:text-violet-700
          "
        >
          Ver mais
        </Link>
      </div>

      <div
        className="
          flex
          gap-4
          overflow-x-auto
          pb-2
          scrollbar-hide
        "
      >
        {produtos.map((produto) => (
          <HomeProductCard
            key={produto.id}
            produto={produto}
          />
        ))}
      </div>
    </section>
  );
}