"use client";

import { useState } from "react";
import { Produto } from "@/src/components/produto/types/produtos";

type Props = {
  produto: Produto;
};

export default function ProductDescription({
  produto,
}: Props) {
  const [expandido, setExpandido] = useState(false);

  const descricao =
    produto.descricao ||
    produto.detalhes ||
    "Descrição não disponível.";

  const textoLongo = descricao.length > 220;

  return (
    <section className="mx-auto mt-24 max-w-5xl">

      <h2 className="mb-12 text-center text-4xl font-bold text-slate-900">
        Descrição do Produto
      </h2>

      <div className="relative">

        <div
          className={`whitespace-pre-line text-lg leading-8 text-slate-700 transition-all duration-300 ${
            !textoLongo || expandido ? "" : "line-clamp-4"
          }`}
        >
          {descricao}
        </div>

        {textoLongo && !expandido && (
          <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-full bg-linear-to-t from-white to-transparent" />
        )}

      </div>

      {textoLongo && (
        <div className="mt-10 flex justify-center">

          <button
            onClick={() => setExpandido(!expandido)}
            className="text-3xl font-bold text-slate-900 transition hover:text-violet-600"
          >
            {expandido ? "Ver menos" : "Ver mais"}
          </button>

        </div>
      )}

    </section>
  );
}
