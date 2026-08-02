"use client";

import { Button } from "@/src/components/ui/button";

import type { CJProduct } from "./types";

type Props = {
  produto: CJProduct | null;

  open: boolean;

  loading: boolean;

  onClose: () => void;

  onImport: () => void;
};

export default function CjImportDialog({
  produto,
  open,
  loading,
  onClose,
  onImport,
}: Props) {
  if (!open || !produto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <h2 className="text-2xl font-bold">
          {produto.nameEn}
        </h2>

        <img
          src={produto.bigImage}
          alt={produto.nameEn}
          className="mt-4 h-60 w-full rounded-lg object-cover"
        />

        <p className="mt-4 text-lg font-semibold">
          US$ {produto.sellPrice}
        </p>

        <div className="mt-6 flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            onClick={onImport}
            disabled={loading}
          >
            {loading
              ? "Importando..."
              : "Importar"}
          </Button>

        </div>

      </div>
    </div>
  );
}