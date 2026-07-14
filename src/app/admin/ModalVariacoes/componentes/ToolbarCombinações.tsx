"use client";

import { Button } from "@/src/components/ui/button";

import {
  RotateCcw,
  Save,
} from "lucide-react";

interface Props {
  salvando?: boolean;

  onSalvar: () => void;

  onGerarNovamente: () => void;
}

export default function ToolbarCombinacoes({
  salvando = false,
  onSalvar,
  onGerarNovamente,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-background p-4">

      <div>

        <h3 className="text-lg font-semibold">
          Gerenciamento das combinações
        </h3>

        <p className="text-sm text-muted-foreground">
          Altere SKU, preço, estoque e status das
          combinações geradas.
        </p>

      </div>

      <div className="flex gap-3">

        <Button
          variant="outline"
          onClick={onGerarNovamente}
        >
          <RotateCcw className="mr-2 h-4 w-4" />

          Gerar novamente

        </Button>

        <Button
          disabled={salvando}
          onClick={onSalvar}
        >
          <Save className="mr-2 h-4 w-4" />

          {salvando
            ? "Salvando..."
            : "Salvar alterações"}

        </Button>

      </div>

    </div>
  );
}