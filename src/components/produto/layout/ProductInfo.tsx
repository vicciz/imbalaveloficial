"use client";

import { Produto } from "@/src/components/produto/types/produtos";
import { Star } from "lucide-react";
import SeletorVariacoes from "./SeletorVariacoes";

type Props = {
  produto: Produto;

  variacao?: {
    variacaoSelecionada: any;
    atributos: {
      nome: string;
      valores: string[];
    }[];

    atributosSelecionados: Record<string, string>;

    selecionarAtributo: (
      tipo: string,
      valor: string
    ) => void;
  };
};

export default function ProductInfo({
  produto,
  variacao,
}: Props) {

  const preco =
    variacao?.variacaoSelecionada?.preco ??
    produto.preco;

  // Fallback enquanto o produto ainda não possui avaliações reais
  const rating = produto.rating ?? 5;
  const reviews = produto.reviews ?? 1;

  return (
    <div className="flex h-full flex-col">

      {/* Avaliação */}
      <div className="mb-6 flex items-center gap-1">

        {[1, 2, 3, 4, 5].map((item) => (
          <Star
            key={item}
            className={`h-6 w-6 ${
              item <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300"
            }`}
          />
        ))}

        <span className="ml-3 text-sm text-slate-500">
          {reviews} avaliações
        </span>

      </div>

      {/* Nome */}
      <h1 className="text-5xl font-light text-slate-800">
        {produto.nome}
      </h1>

      {/* Descrição */}
      <p className="mt-6 max-w-md text-lg leading-8 text-slate-600">
        {produto.descricao}
      </p>

      {/* Preço */}
      <div className="mt-5">

        <h2 className="text-5xl font-medium text-red-600">
          {Number(preco).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </h2>

      </div>

      {/* Variações */}
      <div className="mt-8 flex items-center gap-3">
        <SeletorVariacoes
          atributos={variacao?.atributos ?? []}
          atributosSelecionados={
            variacao?.atributosSelecionados ?? {}
          }
          onSelecionar={
            variacao?.selecionarAtributo ??
            (() => {})
          }
        />
      </div>

      {/* Promoções */}
      <div className="mt-8 flex items-center gap-3">

        <span className="text-slate-500">
          Receber promoções
        </span>

        <button className="flex h-6 w-11 items-center rounded-full bg-slate-200 p-1">
          <span className="h-4 w-4 rounded-full bg-white shadow" />
        </button>

      </div>

    </div>
  );
}
