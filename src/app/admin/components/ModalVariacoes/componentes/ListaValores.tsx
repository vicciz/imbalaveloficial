"use client";

import { Badge } from "@/src/components/ui/badge";
import { X } from "lucide-react";

interface Props {
  tipo: any;

  onRemover: (id: number) => void;
}

export default function ListaValores({
  tipo,
  onRemover,
}: Props) {
  return (
    <div className="space-y-3">

      <h3 className="text-lg font-semibold">
        {tipo.nome}
      </h3>

      <div className="flex flex-wrap gap-2">

        {tipo.variacao_valor?.length ? (
          tipo.variacao_valor.map(
            (valor: any) => (
              <Badge
                key={valor.id}
                className="
                flex
                items-center
                gap-2
                rounded-full
                px-4
                py-2
                text-sm
                "
              >
                {valor.valor}

                <button
                  onClick={() =>
                    onRemover(valor.id)
                  }
                >
                  <X className="h-3 w-3 text-red-500" />
                </button>
              </Badge>
            )
          )
        ) : (
          <span className="text-sm text-muted-foreground">
            Nenhum valor cadastrado.
          </span>
        )}

      </div>

    </div>
  );
}