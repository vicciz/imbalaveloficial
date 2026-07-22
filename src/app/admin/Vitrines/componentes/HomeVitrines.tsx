"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import {
  listarVitrines,
  listarProdutosDaVitrine,
} from "@/src/services/vitrine";

import type {
  Produto,
} from "@/src/components/produto/types/produtos";

import type {
  VitrineSecao,
} from "@/src/services/vitrine/types";

type VitrineComProdutos = {

  vitrine: VitrineSecao;

  produtos: Produto[];

};
import ProductSection from "../../produtos/ProductSection";

export default function HomeVitrines() {

  const [vitrines, setVitrines] =

    useState<VitrineComProdutos[]>([]);

  useEffect(() => {

    async function carregar() {

      const { data } =
        await listarVitrines();

      if (!data) return;

      const lista =
        await Promise.all(

          data
            .filter(v => v.ativo)
            .map(async vitrine => {

              const {
                data: produtos,
              } =
                await listarProdutosDaVitrine(
                  vitrine
                );

              return {

                vitrine,

                produtos:
                  produtos?.slice(
                    0,
                    vitrine.quantidade
                  ) ?? [],

              };

            })

        );

      setVitrines(lista);

    }

    carregar();

  }, []);

  if (!vitrines.length) {
  return (
    <div className="space-y-10">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="
            rounded-3xl
            bg-white
            p-6
            shadow-sm
          "
        >
          <div className="mb-6 h-8 w-56 animate-pulse rounded bg-zinc-200" />

          <div className="flex gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="
                  h-[330px]
                  w-[210px]
                  animate-pulse
                  rounded-xl
                  bg-zinc-200
                "
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

  return (

    <div className="mx-auto max-w-7xl space-y-12 px-4">

      {vitrines.map(item => (

        <motion.section
    key={item.vitrine.id}
    className="mb-16"
    initial={{
        opacity: 0,
        y: 40,
    }}
    whileInView={{
        opacity: 1,
        y: 0,
    }}
    viewport={{
        once: true,
        amount: 0.2,
    }}
    transition={{
        duration: 0.5,
    }}
>

          <ProductSection

            titulo={item.vitrine.titulo}

            produtos={item.produtos}

        />

       </motion.section>

      ))}

    </div>

  );

}