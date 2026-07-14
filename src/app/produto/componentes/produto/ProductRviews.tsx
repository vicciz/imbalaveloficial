"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Produto } from "@/src/services/produtos";

type Props = {
  produto: Produto;
};

export default function ProductReviews({
  produto,
}: Props) {

  const [nota, setNota] = useState(0);

  return (
    <section className="mt-24 border-t border-slate-200 pt-12">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-4xl font-bold text-slate-900">
            Comentários ({produto.reviews ?? 0})
          </h2>

          <div className="mt-5 flex items-center gap-4">

            <span className="text-2xl font-semibold">
              Avaliar
            </span>

            <div className="flex gap-2">

              {[1, 2, 3, 4, 5].map((item) => (

                <button
                  key={item}
                  onClick={() => setNota(item)}
                >

                  <Star
                    className={`h-9 w-9 transition

                    ${
                      item <= nota
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300 hover:text-yellow-400"
                    }

                    `}
                  />

                </button>

              ))}

            </div>

          </div>

        </div>

        <button className="rounded-xl bg-violet-600 px-10 py-4 text-lg font-semibold text-white transition hover:bg-violet-700">
          Comprar Agora
        </button>

      </div>

      {nota > 0 && (

        <div className="mt-10 rounded-xl border border-slate-200 p-6">

          <h3 className="mb-4 text-xl font-semibold">
            Escreva sua avaliação
          </h3>

          <textarea
            rows={5}
            placeholder="Conte sua experiência com este produto..."
            className="w-full rounded-lg border border-slate-300 p-4 outline-none focus:border-violet-500"
          />

          <div className="mt-5 flex justify-end">

            <button
              className="rounded-lg bg-violet-600 px-8 py-3 font-semibold text-white hover:bg-violet-700"
            >
              Enviar avaliação
            </button>

          </div>

        </div>

      )}

    </section>
  );
}