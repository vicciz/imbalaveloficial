"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";

import { QuantitySelector } from "./QuantitySelector";
import { ItemPrice } from "./ItemPrice";

type Props = {
  item: any;

  imagem: string;

atributos: {
  tipo: string;
  valor: string;
}[];

  quantidade: number;

  precoUnitario: number;

  subtotal: number;

  selecionado: boolean;

  atualizando: boolean;

  onSelecionar: () => void;

  onAumentar: () => void;

  onDiminuir: () => void;

  onRemover: () => void;
};

export function ArticleCart({
  item,
  imagem,
  atributos,
  quantidade,
  precoUnitario,
  subtotal,
  selecionado,
  atualizando,
  onSelecionar,
  onAumentar,
  onDiminuir,
  onRemover,
}: Props) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row">

        <div className="pt-1">
          <input
            type="checkbox"
            checked={selecionado}
            onChange={onSelecionar}
            className="h-4 w-4 rounded border-slate-300 text-violet-600"
          />
        </div>

        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-white">
          <Image
            src={imagem}
            alt={item.produto.nome}
            fill
            className="object-contain"
          />
        </div>

        <div className="flex-1">

          <h2 className="text-lg font-semibold">
            {item.produto.nome}
          </h2>

          <div className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
            {atributos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {atributos.map((atributo) => (
                <span
                  key={`${atributo.tipo}-${atributo.valor}`}
                  className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                >
                  {atributo.valor}
                </span>
              ))}
            </div>
          )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">

            <QuantitySelector
              value={quantidade}
              loading={atualizando}
              onIncrease={onAumentar}
              onDecrease={onDiminuir}
            />

            <Button
              variant="destructive"
              onClick={onRemover}
              disabled={atualizando}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </Button>

          </div>

        </div>

        <ItemPrice
          preco={precoUnitario}
          subtotal={subtotal}
        />

      </div>
    </article>
  );
}