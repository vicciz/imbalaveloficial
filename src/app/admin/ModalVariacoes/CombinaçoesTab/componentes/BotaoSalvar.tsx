"use client";

import { Loader2, Save } from "lucide-react";

import { Button } from "@/src/components/ui/button";

interface Props {
  salvando: boolean;
  onSalvar: () => void;
}

export default function BotaoSalvar({
  salvando,
  onSalvar,
}: Props) {
  return (
    <div className="sticky bottom-0 border-t bg-background pt-6">

      <Button
        onClick={onSalvar}
        disabled={salvando}
        className="h-11 w-full"
      >
        {salvando ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar alterações
          </>
        )}
      </Button>

    </div>
  );
}