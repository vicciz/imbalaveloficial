"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import HomeProductCard from "../Vitrines/componentes/HomeProductCard";

import type { Produto } from "@/src/components/produto/types/produtos";

type Props = {
  titulo: string;
  produtos: Produto[];
};

export default function ProductSection({
  titulo,
  produtos,
}: Props) {
  if (!produtos.length) return null;

  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollLeft() {
    scrollRef.current?.scrollBy({
      left: -900,
      behavior: "smooth",
    });
  }

function scrollRight() {
  scrollRef.current?.scrollBy({
    left: 900,
    behavior: "smooth",
  });
}
  return (
  <section
    className="
      mt-10
      mb-14
      rounded-3xl
      border
      border-zinc-200
      bg-white
      p-6
      shadow-md
      transition-shadow
      duration-300
      hover:shadow-lg
    "
      ><div
  className="
    -mx-6
    -mt-6
    mb-6
    h-1
    rounded-t-3xl
    bg-gradient-to-r
    from-violet-700
    via-fuchsia-500
    to-violet-700
  "
/>
      
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[28px] font-semibold text-zinc-800">
          {titulo}
        </h2>

      <Link
          href="#"
          className="
            text-sm
            font-medium
            text-violet-600
            hover:underline
          "
        >
          Ver mais
        </Link>
      </div>

<div className="relative">

  <button
    onClick={scrollLeft}
    className="
      absolute
      left-0
      top-1/2
      z-20
      -translate-y-1/2
      rounded-full
      bg-white
      p-3
      shadow-lg
      transition
      hover:scale-105
    "
  >
    <ChevronLeft size={22} />
  </button>

  <div
    ref={scrollRef}
    className="
      flex
      gap-4
      overflow-x-auto
      scroll-smooth
      px-12
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

        <button
          onClick={scrollRight}
          className="
            absolute
            right-0
            top-1/2
            z-20
            -translate-y-1/2
            rounded-full
            bg-white
            p-3
            shadow-lg
            transition
            hover:scale-105
          "
        >
          <ChevronRight size={22} />
        </button>

</div>

        
        
    </section>

  );
}