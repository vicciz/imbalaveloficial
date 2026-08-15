"use client";

import Image from "next/image";

interface ProdutoHeaderProps {
  nome: string;
  imagem?: string | null;
}

export default function ProdutoHeader({
  nome,
  imagem,
}: ProdutoHeaderProps) {
  return (
    <div className="flex items-start gap-5">
      <div className="relative h-24 w-24 overflow-hidden rounded-xl border bg-white">
        <Image
          src={imagem || "/placeholder.png"}
          alt={nome}
          fill
          className="object-contain p-2"
        />
      </div>

      <div className="flex flex-col justify-center">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Produto
        </span>

        <h2 className="mt-1 text-2xl font-bold">
          {nome}
        </h2>
      </div>
    </div>
  );
}