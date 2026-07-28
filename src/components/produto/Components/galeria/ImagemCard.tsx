"use client";

import Image from "next/image";

import {
  Pencil,
  Trash2,
  Star,
} from "lucide-react";

import {
  Button,
} from "@/src/components/ui/button";

import type {
  ImagemGaleria,
} from "./types";

interface Props {

  imagem: ImagemGaleria;

  onExcluir: () => void;

  onEditar: () => void;

  onPrincipal: () => void;
}

export default function ImagemCard({
  imagem,
  onExcluir,
  onEditar,
  onPrincipal,
}: Props) {

  return (
    <div className="border rounded-xl overflow-hidden">

      <div className="relative aspect-square group">

        <Image
          src={imagem.url}
          alt=""
          fill
          className="object-cover"
        />

        <div
          className="
          absolute
          inset-0
          bg-black/60
          opacity-0
          group-hover:opacity-100
          transition
          flex
          items-center
          justify-center
          gap-2
        "
        >
          <Button
            size="icon"
            variant="secondary"
            onClick={onEditar}
          >
            <Pencil className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="secondary"
            onClick={onExcluir}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-3">

        <Button
          className="w-full"
          variant={
            imagem.principal
              ? "default"
              : "outline"
          }
          onClick={onPrincipal}
        >
          <Star className="w-4 h-4 mr-2" />

          {imagem.principal
            ? "Principal"
            : "Definir Principal"}
        </Button>

      </div>

    </div>
  );
}