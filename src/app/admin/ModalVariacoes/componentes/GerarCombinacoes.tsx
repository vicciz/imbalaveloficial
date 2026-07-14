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
    campo: string,
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

  const atributos = Array.from(
    new Set(
      variacoes.flatMap(
        (variacao: any) =>
          variacao.produto_variacao_item?.map(
            (item: any) =>
              item.variacao_valor?.variacao_tipo?.nome
          ) ?? []
      )
    )
  ).filter(Boolean);

  return (
    <div className="overflow-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>

            {atributos.map((nome: any) => (
              <TableHead key={nome}>
                {nome}
              </TableHead>
            ))}

            <TableHead>Preço</TableHead>

            <TableHead>Estoque</TableHead>

            <TableHead className="text-center">
              Ativo
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {variacoes.map((variacao: any) => (
            <TableRow key={variacao.id}>
              <TableCell className="font-medium">
                {variacao.sku}
              </TableCell>

              {atributos.map((nome: any) => {
                const valor =
                  variacao.produto_variacao_item?.find(
                    (item: any) =>
                      item.variacao_valor?.variacao_tipo
                        ?.nome === nome
                  );

                return (
                  <TableCell key={nome}>
                    {valor?.variacao_valor?.valor ?? "-"}
                  </TableCell>
                );
              })}

              <TableCell>
                <Input
                  type="number"
                  value={variacao.preco ?? 0}
                  onChange={(e) =>
                    onAlterar(
                      variacao.id,
                      "preco",
                      Number(e.target.value)
                    )
                  }
                  className="w-28"
                />
              </TableCell>

              <TableCell>
                <Input
                  type="number"
                  value={variacao.estoque ?? 0}
                  onChange={(e) =>
                    onAlterar(
                      variacao.id,
                      "estoque",
                      Number(e.target.value)
                    )
                  }
                  className="w-24"
                />
              </TableCell>

              <TableCell className="text-center">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}