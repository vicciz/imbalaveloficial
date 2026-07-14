"use client";

import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";

interface Props {
  tipos: any[];
  atributosSelecionados: number[];

  onToggle: (
    id: number,
    ativo: boolean
  ) => void;
}

export default function ListaAtributosProduto({
  tipos,
  atributosSelecionados,
  onToggle,
}: Props) {
  if (!tipos.length) {
    return (
      <div className="text-sm text-muted-foreground">
        Nenhum atributo cadastrado.
      </div>
    );
  }

  return (
    <div className="space-y-5">

      <h3 className="text-lg font-semibold">
        Atributos do produto
      </h3>

      <div className="space-y-4">

        {tipos.map((tipo: any) => {

          const ativo =
            atributosSelecionados.includes(
              tipo.id
            );

          return (
            <div
              key={tipo.id}
              className="
                flex
                items-center
                justify-between
                rounded-lg
                border
                px-3
                py-2
              "
            >
              <Label className="cursor-pointer">
                {tipo.nome}
              </Label>

              <Switch
                checked={ativo}
                onCheckedChange={(v) =>
                  onToggle(
                    tipo.id,
                    v
                  )
                }
              />

            </div>
          );
        })}

      </div>

    </div>
  );
}