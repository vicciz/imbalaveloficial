"use client";

import { useEffect, useState } from "react";

import {
  listarProdutos,
  type Produto,
} from "@/src/services/produto/produtos";

import ProductCard from "./ProductCard";

type Props = {
  quantidade?: number;
};

export default function ListProductCard({
  quantidade = 6,
}: Props) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarProdutos() {
      const { data, error } = await listarProdutos();

      if (error) {
        console.error(error);
        setProdutos([]);
      } else {
        setProdutos(data ?? []);
      }

      setLoading(false);
    }

    carregarProdutos();
  }, []);

  if (loading) {
    return (
      <div
        className="
          grid
          grid-cols-2
          gap-4
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-6
        "
      >
        {Array.from({ length: quantidade }).map((_, index) => (
          <div
            key={index}
            className="
              aspect-[3/4]
              animate-pulse
              rounded-lg
              bg-zinc-200
            "
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-2
        gap-4
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-6
      "
    >
      {produtos
        .slice(0, quantidade)
        .map((produto) => (
          <ProductCard
            key={produto.id}
            produto={produto}
          />
        ))}
    </div>
  );
}