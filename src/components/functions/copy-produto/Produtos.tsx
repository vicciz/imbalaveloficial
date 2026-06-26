"use client";

import Link from "next/link";
import { Produto } from "@/src/services/produtos";
import { supabase } from "@/supabaseClient";

interface ProdutoCardProps {
  produto: Produto;
}

export default function ProdutoCard({
  produto,
}: ProdutoCardProps) {
  const principal =
    produto.produto_imagem?.find(
      (img) => img.principal
    ) ?? produto.produto_imagem?.[0];

  const imagem = principal
    ? supabase.storage
        .from("produtos")
        .getPublicUrl(principal.caminho)
        .data.publicUrl
    : "/placeholder.png";

  return (
    <Link
      href={`/produto/${produto.id}`}
      className="
        block
        bg-white
        rounded-2xl
        overflow-hidden
        shadow-lg
        hover:shadow-2xl
        hover:-translate-y-1
        transition-all
        duration-300
      "
    >
      <img
        src={imagem}
        alt={produto.nome}
        className="w-full aspect-square object-cover"
      />

      <div className="p-4">

        <h2 className="font-semibold line-clamp-2">
          {produto.nome}
        </h2>

        {produto.descricao && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {produto.descricao}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">

          <span className="text-2xl font-bold text-indigo-600">
            {Number(produto.preco).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>

          <span className="text-yellow-500">
            ⭐ {produto.rating ?? 5}
          </span>

        </div>

      </div>
    </Link>
  );
}