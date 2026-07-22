"use client";

import { cn } from "@/lib/utils";

type Props = {
  atributos: {
    nome: string;
    valores: string[];
  }[];
  atributosSelecionados: Record<string, string>;
  onSelecionar: (tipo: string, valor: string) => void;
};

export default function SeletorVariacoes({
  atributos,
  atributosSelecionados,
  onSelecionar,
}: Props) {
  return (
    <div className="space-y-6">
      {atributos.map((atributo) => (
        <div key={atributo.nome} className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {atributo.nome}
          </p>

          <div className="flex flex-wrap gap-2">
            {atributo.valores.map((valor) => {
              const selecionado =
                atributosSelecionados[atributo.nome] === valor;

              return (
                <button
                  key={valor}
                  type="button"
                  onClick={() => onSelecionar(atributo.nome, valor)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    selecionado
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-violet-400 hover:text-violet-600"
                  )}
                >
                  {valor}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
