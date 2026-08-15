"use client";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

interface Props {
  tipos: any[];

  tipoSelecionado: number | null;

  valor: string;

  onSelecionar: (id: number) => void;

  onChange: (valor: string) => void;

  onAdicionar: () => void;
}

export default function SeletorAtributo({
  tipos,
  tipoSelecionado,
  valor,
  onSelecionar,
  onChange,
  onAdicionar,
}: Props) {
  return (
    <div className="space-y-3">
      <span className="text-sm text-muted-foreground">
        Selecione o atributo do produto
      </span>

      <div className="flex items-center gap-3">
        <Select
          value={
            tipoSelecionado
              ? tipoSelecionado.toString()
              : ""
          }
          onValueChange={(value) =>
            onSelecionar(Number(value))
          }
        >
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Atributo" />
          </SelectTrigger>

          <SelectContent>
            {tipos.map((tipo) => (
              <SelectItem
                key={tipo.id}
                value={tipo.id.toString()}
              >
                {tipo.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={valor}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder="Digite um valor"
          className="max-w-xs"
        />

        <Button onClick={onAdicionar}>
          Adicionar
        </Button>
      </div>
    </div>
  );
}