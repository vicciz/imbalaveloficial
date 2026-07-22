"use client";

import Image from "next/image";
import Link from "next/link";

import type { Produto } from "@/src/components/produto/types/produtos";

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
  group
  w-[210px]
  flex-shrink-0
  overflow-hidden
  rounded-xl
  border
  border-zinc-200
  bg-white
  transition-all
  duration-300
  hover:-translate-y-1
  hover:border-violet-200
  hover:shadow-xl
">
     <div
  className="
    flex
    h-56
    items-center
    justify-center
    border-b
    border-zinc-100
    bg-white
    p-5
  "
>
        <Image
          src={produto.image || "/placeholder.png"}
          alt={produto.nome ?? "Produto"}
          width={190}
          height={190}
          className="
            h-auto
            max-h-[180px]
            w-auto
            object-contain
            transition-all
            duration-500
            group-hover:scale-110
          "
          />
      </div>

      <div className="pb-4">
      <h3
        className="
          line-clamp-2
          h-10
          text-sm
          text-zinc-700
        "
      >
          {produto.nome}
        </h3>

        <div className="mt-3">
          <span className="text-[34px]
tracking-tight
transition-colors
duration-300
group-hover:text-violet-700 font-light tracking-tight">
            {Number(produto.preco).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>

       <p
        className="
          mt-3
          text-sm
          font-semibold
          text-green-600
      transition-all
      duration-300
      group-hover:translate-x-1
        "
      >
          Frete grátis
        </p>

        <div
  className="
    mt-4
    opacity-0
    translate-y-2
    transition-all
    duration-300
    group-hover:translate-y-0
    group-hover:opacity-100
  "
>
  <button
    className="
      w-full
      rounded-lg
      bg-violet-600
      py-2
      text-sm
      font-semibold
      text-white
      transition
      hover:bg-violet-700
    "
  >
    Ver produto
  </button>
</div>
      </div>
    </Link>
  );
}