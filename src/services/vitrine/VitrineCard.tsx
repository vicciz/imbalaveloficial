"use client";

import { useEffect, useState } from "react";

import {
  Pencil,
  Trash2,
} from "lucide-react";

import type {
  Produto,
} from "@/src/components/produto/types/produtos";

import type {
  VitrineSecao,
} from "@/src/services/vitrine/types";

import {
  listarProdutosDaVitrine,
} from "@/src/services/vitrine";

import ProductCard from "@/src/components/layout/Home/ListCardProduto/ProductCard";

import { Badge } from "@/src/components/ui/badge";

import { Button } from "@/src/components/ui/button";

import { Switch } from "@/src/components/ui/switch";

type Props = {

  vitrine: VitrineSecao;

  onEdit(vitrine: VitrineSecao): void;

  onDelete(id: number): void;

  onToggle(
    vitrine: VitrineSecao,
    ativo: boolean
  ): void;

};

export default function VitrineCard({

  vitrine,

  onEdit,

  onDelete,

  onToggle,

}: Props) {

  const [produtos, setProdutos] =
    useState<Produto[]>([]);

  useEffect(() => {

    async function carregar() {

      const { data } =
        await listarProdutosDaVitrine(
          vitrine
        );

      setProdutos(data ?? []);

    }

    carregar();

  }, [vitrine]);

  return (

    <div
      className="
        rounded-2xl
        border
        bg-white
        p-6
        shadow-sm
      "
    >

      <div
        className="
          mb-6
          flex
          items-center
          justify-between
        "
      >

        <div>

          <h2
            className="
              text-2xl
              font-semibold
            "
          >

            {vitrine.titulo}

          </h2>

          <div
            className="
              mt-2
              flex
              gap-2
            "
          >

            <Badge>

              {vitrine.tipo}

            </Badge>

            <Badge
              variant={
                vitrine.ativo
                  ? "default"
                  : "secondary"
              }
            >

              {vitrine.ativo

                ? "Ativa"

                : "Inativa"}

            </Badge>

            <Badge
              variant="outline"
            >

              {produtos.length} produtos

            </Badge>

          </div>

        </div>

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <Switch
            checked={vitrine.ativo}
            onCheckedChange={checked =>
              onToggle(
                vitrine,
                checked
              )
            }
          />

          <Button
            size="icon"
            variant="outline"
            onClick={() =>
              onEdit(vitrine)
            }
          >

            <Pencil
              className="h-4 w-4"
            />

          </Button>

          <Button
            size="icon"
            variant="destructive"
            onClick={() =>
              onDelete(vitrine.id)
            }
          >

            <Trash2
              className="h-4 w-4"
            />

          </Button>

        </div>

      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-5
          lg:grid-cols-4
        "
      >

        {produtos
          .slice(
            0,
            vitrine.quantidade
          )
          .map(produto => (

            <ProductCard

              key={produto.id}

              produto={produto}

            />

          ))}

      </div>

    </div>

  );

}