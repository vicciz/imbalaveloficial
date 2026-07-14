
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";

interface Props {
  variacoes?: any[];
  onAlterar: (
    id: number,
    campo: "sku" | "preco" | "estoque" | "ativo",
    valor: any
  ) => void;
}

export default function TabelaCombinacoes({
  variacoes = [],
  onAlterar,
}: Props) {
  if (!Array.isArray(variacoes) || variacoes.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center rounded-xl border border-dashed">
        <span className="text-muted-foreground">
          Nenhuma combinação encontrada.
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[240px]">Variação</TableHead>
            <TableHead className="min-w-[180px]">SKU</TableHead>
            <TableHead className="w-36">Preço</TableHead>
            <TableHead className="w-28">Estoque</TableHead>
            <TableHead className="w-24 text-center">Ativo</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {variacoes.map((variacao: any) => (
            <TableRow key={variacao.id}>
              <TableCell>
             <Input
                className="h-10"
                placeholder="SKU"
                value={variacao.sku ?? ""}
                onChange={(e) =>
                  onAlterar(
                    variacao.id,
                    "sku",
                    e.target.value
                  )
                }
              />
          </TableCell>

              <TableCell>
                <Input
                  value={variacao.sku ?? ""}
                  onChange={(e) =>
                    onAlterar(variacao.id, "sku", e.target.value)
                  }
                />
              </TableCell>

              <TableCell>
  <div className="relative w-36">
    <span
      className="
        absolute
        left-3
        top-1/2
        -translate-y-1/2
        text-sm
        text-muted-foreground
      "
    >
      R$
    </span>

    <Input
      type="number"
      step="0.01"
      min="0"
      placeholder="0,00"
      className="
        h-10
        pl-9
        text-right
        [appearance:textfield]
        [&::-webkit-inner-spin-button]:appearance-none
        [&::-webkit-outer-spin-button]:appearance-none
      "
      value={variacao.preco ?? ""}
      onChange={(e) =>
        onAlterar(
          variacao.id,
          "preco",
          Number(e.target.value)
        )
      }
    />
  </div>
</TableCell>

              <TableCell>
  <Input
    type="number"
    min="0"
    placeholder="0"
    className="
      h-10
      w-24
      text-right
      [appearance:textfield]
      [&::-webkit-inner-spin-button]:appearance-none
      [&::-webkit-outer-spin-button]:appearance-none
    "
    value={variacao.estoque ?? ""}
    onChange={(e) =>
      onAlterar(
        variacao.id,
        "estoque",
        Number(e.target.value)
      )
    }
  />
</TableCell>

              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch
                    checked={!!variacao.ativo}
                    onCheckedChange={(v) =>
                      onAlterar(
                        variacao.id,
                        "ativo",
                        v
                      )
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}