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
import ProductSection from "../../../produtos/ProductSection";

export default function HomeVitrines() {

  const [vitrines, setVitrines] =

    useState<VitrineComProdutos[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function carregar() {
      try {
        const { data, error } = await listarVitrines(true);

        if (error) {
          console.error(
            "Não foi possível carregar as vitrines da Home.",
            error
          );
          return;
        }

        if (!data) return;

        const lista = await Promise.all(
          data
            .filter(v => v.ativo)
            .map(async vitrine => {
              try {
                const { data: produtos, error: produtosError } =
                  await listarProdutosDaVitrine(vitrine, true);

                if (produtosError) {
                  console.error(
                    `Não foi possível carregar os produtos da vitrine ${vitrine.id}.`,
                    produtosError
                  );
                  return null;
                }

                return {
                  vitrine,
                  produtos: produtos?.slice(0, vitrine.quantidade) ?? [],
                };
              } catch (error) {
                console.error(
                  `Não foi possível carregar os produtos da vitrine ${vitrine.id}.`,
                  error
                );
                return null;
              }
            })
        );

        if (active) {
          setVitrines(
            lista.filter(
              (item): item is VitrineComProdutos => item !== null
            )
          );
        }
      } catch (error) {
        console.error(
          "Não foi possível carregar os dados das vitrines da Home.",
          error
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }

    }

    void carregar();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="
            rounded-3xl
            bg-white
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

  if (!vitrines.length) return null;

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

