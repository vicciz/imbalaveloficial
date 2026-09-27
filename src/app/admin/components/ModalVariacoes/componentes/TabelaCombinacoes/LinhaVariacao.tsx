"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";

import {
  TableCell,
  TableRow,
} from "@/src/components/ui/table";

interface Props {
  variacao: any;
  atributos: string[];

  onAlterar: (
    id: number,
    campo: string,
    valor: any
  ) => void;
}

export default function LinhaVariacao({
  variacao,
  atributos,
  onAlterar,
}: Props) {
  const item = variacao.item ?? variacao.produto_variacao_item?.[0] ?? variacao;
  const itemId = variacao.itemId ?? item.id ?? variacao.id;

  return (
    <TableRow className="hover:bg-muted/40">

      <TableCell className="font-medium">
        {item.sku ?? variacao.sku}
      </TableCell>

      {atributos.map((nome) => {

        const valor =
          variacao.produto_variacao_item.find(
            (item: any) =>
              item.variacao_valor
                ?.variacao_tipo
                ?.nome === nome
          );

        return (
          <TableCell key={nome}>
            {valor?.variacao_valor?.valor ??
              "-"}
          </TableCell>
        );
      })}

      <TableCell>

        <Input
          type="number"
          value={item.preco ?? variacao.preco ?? 0}
          className="w-28 text-center"
          onChange={(e) =>
            onAlterar(
              itemId,
              "preco",
              Number(e.target.value)
            )
          }
        />

      </TableCell>

      <TableCell>

        <Input
          type="number"
          value={item.estoque ?? variacao.estoque ?? 0}
          className="w-20 text-center"
          onChange={(e) =>
            onAlterar(
              itemId,
              "estoque",
              Number(e.target.value)
            )
          }
        />

      </TableCell>

      <TableCell className="text-center">

        <Switch
          checked={item.ativo ?? variacao.ativo}
          onCheckedChange={(v) =>
            onAlterar(
              itemId,
              "ativo",
              v
            )
          }
        />

      </TableCell>

      <TableCell>

        <div className="flex justify-center gap-2">

          <Button
            variant="ghost"
            size="icon"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>

        </div>

      </TableCell>

    </TableRow>
  );
}