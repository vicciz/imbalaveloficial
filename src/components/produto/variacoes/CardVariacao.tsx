"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import GaleriaVariacao from "./GaleriaVariacao";

import { CardVariacaoProps } from "./types";
import { useState } from "react";
import { salvarVariacao } from "@/src/components/produto/types/variacoes";
import { Button } from "../../ui/button";
export default function CardVariacao({
  produto,
  variacao,
  imagens,
  setImagens,
  abrirCropper,
}: CardVariacaoProps) {

  const atributos =
    variacao.produto_variacao_item
      .map(
        item =>
          item.variacao_valor.valor
      )
      .join(" / ");

  const idCor =
    variacao.produto_variacao_item.find(
      item =>
        item.variacao_valor
          .variacao_tipo.nome
          .toLowerCase() === "cor"
    )?.variacao_valor.id;
  
  const [preco, setPreco] = useState(variacao.preco ?? 0);
  const [estoque, setEstoque] = useState(variacao.estoque);
  const [sku, setSku] = useState(variacao.sku ?? "");
  return (

    <Card>

      <CardHeader>

        <CardTitle>

          {atributos}

        </CardTitle>

      </CardHeader>

      <CardContent className="space-y-6">

      <div className="grid md:grid-cols-3 gap-6">

        <div>

          <label className="text-sm font-medium">
            Preço
          </label>

          <Input
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
            onClick={async () => {
              await salvarVariacao(variacao.id, {
                preco,
                estoque,
                sku,
                ativo: variacao.ativo,
              });
            }}
          >
            Salvar
            </Button>
            <p className="text-sm text-muted-foreground">
              {imagens.filter(img => img.idValor === idCor).length}
              {" "}
              imagens cadastradas
            </p>
        </div>

      </div>

      <GaleriaVariacao
        titulo={atributos}
        imagens={
          imagens.filter(
            img => img.idValor === idCor
          )
        }
        setImagens={setImagens}
        abrirCropper={abrirCropper}
        idValor={idCor!}
      />

      </CardContent>

    </Card>

  );

}