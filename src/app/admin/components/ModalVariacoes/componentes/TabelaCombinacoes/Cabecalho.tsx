"use client";

import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

interface Props {
  atributos: string[];
}

export default function Cabecalho({
  atributos,
}: Props) {
  return (
    <TableHeader>

      <TableRow>

        <TableHead className="w-44">
          SKU
        </TableHead>

        {atributos.map((atributo) => (
          <TableHead key={atributo}>
            {atributo}
          </TableHead>
        ))}

        <TableHead className="w-32">
          Preço
        </TableHead>

        <TableHead className="w-28">
          Estoque
        </TableHead>

        <TableHead className="text-center w-24">
          Ativo
        </TableHead>

        <TableHead className="text-center w-28">
          Ações
        </TableHead>

      </TableRow>

    </TableHeader>
  );
}