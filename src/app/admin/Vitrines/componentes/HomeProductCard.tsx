"use client";

import Image from "next/image";
import Link from "next/link";

import type { Produto } from "@/src/services/produto/produtos";

type Props = {
  produto: Produto;
};

export default function HomeProductCard({
  produto,
}: Props) {
  return (
    <Link
      href={`/produto/${produto.id}`}
      className="
        w-45
        shrink-0
        rounded-md
        bg-white
        transition
        hover:bg-zinc-50
      "
    >
      <div className="flex h-44 items-center justify-center p-3">
        <Image
          src={produto.image || "/placeholder.png"}
          alt={produto.nome || "Produto"}
          width={170}
          height={170}
          className="max-h-40 w-auto object-contain"
        />
      </div>

      <div className="px-3 pb-4">
        <h3 className="line-clamp-2 text-sm text-zinc-800">
          {produto.nome}
        </h3>

        <div className="mt-3">
          <span className="text-3xl font-light">
            {Number(produto.preco).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>

        <p className="mt-2 text-sm font-medium text-green-600">
          Frete grátis
        </p>
      </div>
    </Link>
  );
}