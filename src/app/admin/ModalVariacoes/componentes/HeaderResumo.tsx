"use client";

import { RefreshCw, Boxes, Package, CheckCircle2, Ban } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import ProdutoHeader from "./ProdutoHeader";

interface Props {
  produtoNome: string;
  produtoImagem?: string | null;

  atributos: number;
  combinacoes: number;

  onGerar?: () => void;
  onDuplicarPreco?: () => void;
  onDuplicarEstoque?: () => void;
  onAtivarTodas?: () => void;
  onDesativarTodas?: () => void;
}

export default function HeaderResumo({
  produtoNome,
  produtoImagem,
  atributos,
  combinacoes,
  onGerar,
  onDuplicarPreco,
  onDuplicarEstoque,
  onAtivarTodas,
  onDesativarTodas,
}: Props) {
  return (
    <div className="rounded-xl border bg-background p-6">
      <div className="flex items-start justify-between gap-8">

        <ProdutoHeader
          nome={produtoNome}
          imagem={produtoImagem}
        />

        <div className="flex gap-12">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Atributos
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {atributos}
            </h2>
          </div>

          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Combinações
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {combinacoes}
            </h2>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">

        <Button
          variant="default"
          onClick={onGerar}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Gerar combinações
        </Button>

        <Button variant="outline" onClick={onDuplicarPreco}>
          <Boxes className="mr-2 h-4 w-4" />
          Duplicar preço
        </Button>

        <Button variant="outline" onClick={onDuplicarEstoque}>
          <Package className="mr-2 h-4 w-4" />
          Duplicar estoque
        </Button>

        <Button variant="outline" onClick={onAtivarTodas}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Ativar todas
        </Button>

        <Button variant="outline" onClick={onDesativarTodas}>
          <Ban className="mr-2 h-4 w-4" />
          Desativar todas
        </Button>

      </div>
    </div>
  );
}