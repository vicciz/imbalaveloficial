"use client";

import { Button } from "@/src/components/ui/button";

interface Props {
  aba: string;

  onGerar: () => void;

  onSalvar: () => void;
}

export default function FooterVariacoes({
  aba,
  onGerar,
  onSalvar,
}: Props) {
  return (
    <div className="border-t bg-background px-8 py-5">

      {aba === "atributos" ? (
        <Button
          className="h-11 w-full"
          onClick={onGerar}
        >
          Gerar combinações
        </Button>
      ) : (
        <Button
          className="h-11 w-full"
          onClick={onSalvar}
        >
          Salvar alterações
        </Button>
      )}

    </div>
  );
}