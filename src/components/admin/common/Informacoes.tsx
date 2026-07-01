"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

import { InformacoesProps } from "./types";

export default function Informacoes({
  produto,
  setProduto,
}: InformacoesProps) {
  function atualizarCampo(
    campo: string,
    valor: string | number
  ) {
    setProduto((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  return (
    <Card>

      <CardHeader>

        <CardTitle>
          Informações do Produto
        </CardTitle>

      </CardHeader>

      <CardContent className="grid gap-6">

        <div className="grid gap-2">

          <Label htmlFor="nome">
            Nome
          </Label>

          <Input
            id="nome"
            value={produto.nome ?? ""}
            onChange={(e) =>
              atualizarCampo(
                "nome",
                e.target.value
              )
            }
          />

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="grid gap-2">

            <Label htmlFor="preco">
              Preço
            </Label>

            <Input
              id="preco"
              type="number"
              step="0.01"
              value={produto.preco ?? ""}
              onChange={(e) =>
                atualizarCampo(
                  "preco",
                  e.target.value
                )
              }
            />

          </div>

          <div className="grid gap-2">

            <Label htmlFor="fornecedor">
              Fornecedor
            </Label>

            <Input
              id="fornecedor"
              value={
                produto.fornecedor ??
                ""
              }
              onChange={(e) =>
                atualizarCampo(
                  "fornecedor",
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <div className="grid gap-2">

          <Label htmlFor="link">
            Link do fornecedor
          </Label>

          <Input
            id="link"
            value={produto.link ?? ""}
            onChange={(e) =>
              atualizarCampo(
                "link",
                e.target.value
              )
            }
          />

        </div>

      </CardContent>

    </Card>
  );
}