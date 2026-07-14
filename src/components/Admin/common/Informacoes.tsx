"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Star } from "lucide-react";

import { InformacoesProps } from "./types";

export default function Informacoes({
  produto,
  setProduto,
}: InformacoesProps) {
  function atualizarCampo(
    campo: string,
    valor: string | number | boolean
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

        <div className="grid md:grid-cols-3 gap-6 items-end">

          <div className="grid gap-2">

            <Label htmlFor="preco">
              Preço
            </Label>

            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-l-md border border-r-0 bg-slate-50 text-sm">R$</span>
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
                className="rounded-l-none"
              />
            </div>

          </div>

          <div className="grid gap-2">

            <Label htmlFor="rating">
              Rating
            </Label>

            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <Input
                id="rating"
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={produto.rating ?? ""}
                onChange={(e) =>
                  atualizarCampo(
                    "rating",
                    e.target.value
                  )
                }
              />
            </div>

          </div>

          <div className="grid gap-2">

            <Label htmlFor="reviews">
              Reviews
            </Label>

            <Input
              id="reviews"
              type="number"
              value={produto.reviews ?? ""}
              onChange={(e) =>
                atualizarCampo(
                  "reviews",
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

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

          <div className="grid gap-2">

            <Label htmlFor="estoque">
              Estoque
            </Label>

            <Input
              id="estoque"
              type="number"
              value={(produto as any).estoque ?? ""}
              onChange={(e) =>
                atualizarCampo(
                  "estoque",
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