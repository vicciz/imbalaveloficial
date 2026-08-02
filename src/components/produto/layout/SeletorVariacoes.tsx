"use client";

import { useMemo } from "react";

import { cn } from "@/src/lib/utils";

type Props = {
  atributos: {
    nome: string;
    valores: string[];
  }[];
  atributosSelecionados: Record<string, string>;
  onSelecionar: (tipo: string, valor: string) => void;
};

type GroupedValue = {
  color: string;
  size: string;
  original: string;
};

const SIZE_ORDER = new Map<string, number>([
  ["XXXS", 0],
  ["XXS", 1],
  ["XS", 2],
  ["PP", 3],
  ["P", 4],
  ["S", 5],
  ["M", 6],
  ["G", 7],
  ["L", 8],
  ["GG", 9],
  ["XL", 10],
  ["XG", 11],
  ["XXL", 12],
  ["XXXL", 13],
]);

function parseGroupedValue(value: string): GroupedValue | null {
  const trimmed = value.trim();

  if (!trimmed || !trimmed.includes("-")) {
    return null;
  }

  const parts = trimmed.split("-").map((part) => part.trim()).filter(Boolean);

  if (parts.length < 2) {
    return null;
  }

  const size = parts[parts.length - 1];
  const color = parts.slice(0, -1).join("-");

  if (!color || !size) {
    return null;
  }

  return {
    color,
    size,
    original: trimmed,
  };
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeSizeLabel(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function getSizeRank(size: string): number {
  const normalized = normalizeSizeLabel(size);
  const directRank = SIZE_ORDER.get(normalized);

  if (directRank != null) {
    return directRank;
  }

  const numbered = normalized.match(/^(\d+)XL$/);
  if (numbered) {
    return 100 + Number(numbered[1]);
  }

  const xlFamily = normalized.match(/^(X+)L$/);
  if (xlFamily) {
    return 90 + xlFamily[1].length;
  }

  return 1000;
}

function sortSizes(values: GroupedValue[]): GroupedValue[] {
  return [...values].sort((left, right) => {
    const rankDiff = getSizeRank(left.size) - getSizeRank(right.size);

    if (rankDiff !== 0) {
      return rankDiff;
    }

    return left.size.localeCompare(right.size, "pt-BR", { sensitivity: "base" });
  });
}

export default function SeletorVariacoes({
  atributos,
  atributosSelecionados,
  onSelecionar,
}: Props) {
  const singleAttribute = atributos.length === 1 ? atributos[0] : null;

  const groupedValues = useMemo(() => {
    if (!singleAttribute) {
      return [];
    }

    return singleAttribute.valores
      .map(parseGroupedValue)
      .filter((item): item is GroupedValue => item !== null);
  }, [singleAttribute]);

  const shouldGroupByColor =
    singleAttribute !== null &&
    groupedValues.length === singleAttribute.valores.length &&
    groupedValues.length > 0;

  if (shouldGroupByColor && singleAttribute) {
    const selectedOriginal = atributosSelecionados[singleAttribute.nome] ?? "";
    const selectedGrouped = parseGroupedValue(selectedOriginal);

    const colors = Array.from(new Set(groupedValues.map((item) => item.color)));
    const selectedColor = selectedGrouped?.color ?? colors[0] ?? "";

    const sizesForColor = sortSizes(
      groupedValues.filter(
        (item) => normalize(item.color) === normalize(selectedColor)
      )
    );

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Cor
          </p>

          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const selected = normalize(selectedColor) === normalize(color);

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    const firstSize = groupedValues.find(
                      (item) => normalize(item.color) === normalize(color)
                    );

                    if (!firstSize) {
                      return;
                    }

                    onSelecionar(singleAttribute.nome, firstSize.original);
                  }}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    selected
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-violet-400 hover:text-violet-600"
                  )}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Tamanho
          </p>

          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((item) => {
              const selected = normalize(selectedOriginal) === normalize(item.original);

              return (
                <button
                  key={item.original}
                  type="button"
                  onClick={() => onSelecionar(singleAttribute.nome, item.original)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    selected
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-violet-400 hover:text-violet-600"
                  )}
                >
                  {item.size}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

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
