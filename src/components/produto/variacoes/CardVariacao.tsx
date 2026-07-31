"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "../../ui/button";
import { useState } from "react";

import GaleriaVariacao from "./GaleriaVariacao";
import { CardVariacaoProps } from "./types";

import { salvarItemVariacao } from "@/src/components/produto/types/variacoes";

export default function CardVariacao({
  produto,
  variacao,
  imagens,
  setImagens,
  abrirCropper,
}: CardVariacaoProps) {
  const atributos = variacao.produto_variacao_item
    .map((item) => item.variacao_valor.valor)
    .join(" / ");

  const idCor = variacao.produto_variacao_item.find(
    (item) =>
      item.variacao_valor.variacao_tipo.nome.toLowerCase() ===
      "cor"
  )?.variacao_valor.id;

  // Cada produto_variacao possui um item comercial
  const item = variacao.produto_variacao_item[0];

  const [preco, setPreco] = useState(item?.preco ?? 0);
  const [estoque, setEstoque] = useState(item?.estoque ?? 0);
  const [sku, setSku] = useState(item?.sku ?? "");

  async function salvar() {
    if (!item) return;

    await salvarItemVariacao(item.id, {
      preco,
      estoque,
      sku,
      ativo: item.ativo,
      imagem_principal: item.imagem_principal,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{atributos}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium">
              Preço
            </label>

            <Input
              type="number"
              value={preco}
              onChange={(e) =>
                setPreco(Number(e.target.value))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Estoque
            </label>

            <Input
              type="number"
              value={estoque}
              onChange={(e) =>
                setEstoque(Number(e.target.value))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              SKU
            </label>

            <Input
              value={sku}
              onChange={(e) =>
                setSku(e.target.value)
              }
            />

            <Button
              className="mt-3"
              onClick={salvar}
            >
              Salvar
            </Button>

            <p className="text-sm text-muted-foreground mt-2">
              {
                imagens.filter(
                  (img) => img.idValor === idCor
                ).length
              }{" "}
              imagens cadastradas
            </p>
          </div>
        </div>

        <GaleriaVariacao
          titulo={atributos}
          imagens={imagens.filter(
            (img) => img.idValor === idCor
          )}
          setImagens={setImagens}
          abrirCropper={abrirCropper}
          idValor={idCor!}
        />
      </CardContent>
    </Card>
  );
}