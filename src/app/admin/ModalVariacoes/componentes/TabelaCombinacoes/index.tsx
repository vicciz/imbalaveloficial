"use client";

import {
  Table,
  TableBody,
} from "@/src/components/ui/table";

import Cabecalho from "./Cabecalho";
import LinhaVariacao from "./LinhaVariacao";
import EmptyState from "./EmptyState";

interface Props {
  variacoes: any[];

  onAlterar: (
    id: number,
    campo: string,
    valor: any
  ) => void;
}

export default function TabelaCombinacoes({
  variacoes,
  onAlterar,
}: Props) {
  if (!variacoes.length) {
    return <EmptyState />;
  }

  const atributos = Array.from(
    new Set(
      variacoes.flatMap((variacao) =>
        variacao.produto_variacao_item.map(
          (item: any) =>
            item.variacao_valor
              ?.variacao_tipo?.nome
        )
      )
    )
  );

  return (
    <div className="overflow-hidden rounded-xl border">

      <div className="max-h-[520px] overflow-auto">

        <Table>

          <Cabecalho
            atributos={atributos}
          />

          <TableBody>

            {variacoes.map((variacao) => (
              <LinhaVariacao
                key={variacao.id}
                variacao={variacao}
                atributos={atributos}
                onAlterar={onAlterar}
              />
            ))}

          </TableBody>

        </Table>

      </div>

    </div>
  );
}