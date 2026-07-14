"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";

import { ConfiguracoesProps } from "./types";

export default function Configuracoes({
  produto,
  setProduto,
  categorias,
}: ConfiguracoesProps) {
  function atualizarCampo(
    campo: string,
    valor: any
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

          Configurações

        </CardTitle>

      </CardHeader>

      <CardContent className="space-y-6">

        <div className="space-y-2">

          <Label>

            Categoria

          </Label>

          <Select
            value={
              produto.categoria_id?.toString() ??
              ""
            }
            onValueChange={(value) =>
              atualizarCampo(
                "categoria_id",
                Number(value)
              )
            }
          >

            <SelectTrigger>

              <SelectValue placeholder="Selecione uma categoria" />

            </SelectTrigger>

            <SelectContent>

              {categorias.map((categoria) => (

                <SelectItem
                  key={categoria.id}
                  value={categoria.id.toString()}
                >

                  {categoria.nome}

                </SelectItem>

              ))}

            </SelectContent>

          </Select>

        </div>

        <div className="flex items-center justify-between">

          <div>

            <Label>

              Produto Oculto

            </Label>

            <p className="text-sm text-muted-foreground">

              O produto ficará invisível na loja.

            </p>

          </div>

          <Switch
            checked={produto.oculto ?? false}
            onCheckedChange={(checked) =>
              atualizarCampo(
                "oculto",
                checked
              )
            }
          />

        </div>

        <div className="flex items-center justify-between">

          <div>

            <Label>

              Produto em Destaque

            </Label>

            <p className="text-sm text-muted-foreground">

              Exibir na página inicial.

            </p>

          </div>

          <Switch
            checked={produto.destaque ?? false}
            onCheckedChange={(checked) =>
              atualizarCampo(
                "destaque",
                checked
              )
            }
          />

        </div>

      </CardContent>

    </Card>
  );
}