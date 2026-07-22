"use client";

import { useEffect, useState } from "react";

import {
  listarVitrines,
  listarProdutosDaVitrine,
} from "@/src/services/vitrine";

import type {
  Produto,
} from "@/src/services/produto/produtos";

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

  return (

    <div className="mx-auto max-w-7xl space-y-12 px-4">

      {vitrines.map(item => (

        <section
          key={item.vitrine.id}
          className="mb-16"
        >

          <ProductSection

            titulo={item.vitrine.titulo}

            produtos={item.produtos}

        />

        </section>

      ))}

    </div>

  );

}