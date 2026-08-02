"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Button } from "@/src/components/ui/button";
import { variantImageService } from "@/src/services/products/services/VariantImageService";

import type { ImagemFormulario } from "@/src/components/Admin/common/types";
import type { ProdutoVariacao } from "@/src/components/produto/types/produtos";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variation: ProdutoVariacao;
  title: string;
  productImages: ImagemFormulario[];
  onSaved: () => Promise<void> | void;
};

export default function VariantImageManagerDialog({
  open,
  onOpenChange,
  variation,
  title,
  productImages,
  onSaved,
}: Props) {
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const persistedImages = useMemo(
    () => productImages.filter((image): image is ImagemFormulario & { id: number } => typeof image.id === "number"),
    [productImages]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const linkedImageIds = variantImageService.getLinkedImageIds(variation);

    if (linkedImageIds.length > 0) {
      setSelectedImageIds(linkedImageIds);
      return;
    }

    const legacyColorValueId = variantImageService.getLegacyColorValueId(variation);

    if (legacyColorValueId == null) {
      setSelectedImageIds([]);
      return;
    }

    setSelectedImageIds(
      persistedImages.filter((image) => image.idValor === legacyColorValueId).map((image) => image.id)
    );
  }, [open, persistedImages, variation]);

  function toggleImage(imageId: number): void {
    setSelectedImageIds((currentIds) =>
      currentIds.includes(imageId)
        ? currentIds.filter((currentId) => currentId !== imageId)
        : [...currentIds, imageId]
    );
  }

  async function handleSave(): Promise<void> {
    try {
      setSaving(true);
      await variantImageService.saveVariationImages(variation.id, selectedImageIds);
      await onSaved();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-4xl p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Gerenciar imagens</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          {persistedImages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Salve imagens na galeria do produto antes de vinculá-las à variação.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {persistedImages.map((image) => {
                const checked = selectedImageIds.includes(image.id);

                return (
                  <label
                    key={image.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-violet-400"
                  >
                    <Checkbox checked={checked} onChange={() => toggleImage(image.id)} className="mt-1" />

                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-slate-50">
                        <Image src={image.url} alt="Imagem do produto" fill className="object-cover" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">Imagem #{image.id}</p>
                        <p className="mt-1 text-xs text-slate-500">Ordem: {image.ordem}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {image.principal ? "Imagem principal do produto" : "Imagem secundária"}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 px-6" showCloseButton={false}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>

          <Button onClick={handleSave} disabled={saving || persistedImages.length === 0}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
