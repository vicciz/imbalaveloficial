"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus } from "lucide-react";

import type {
  ImagemGaleria,
} from "./types";

interface Props {
  imagens: ImagemGaleria[];

  onAdicionar: (
    imagens: ImagemGaleria[]
  ) => void;

  idValor?: number | null;
}

export default function DropArea({
  imagens,
  onAdicionar,
  idValor,
}: Props) {

  const onDrop =
    useCallback(
      (files: File[]) => {

        const novas =
          files.map(
            (
              file,
              index
            ) => ({
              file,

              url:
                URL.createObjectURL(
                  file
                ),

              principal:
                imagens.length ===
                  0 &&
                index === 0,

              ordem:
                imagens.length +
                index,

              idValor:
                idValor ??
                null,
            })
          );

        onAdicionar(
          novas
        );

      },
      [
        imagens,
        idValor,
        onAdicionar,
      ]
    );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({

    accept: {
      "image/*": [],
    },

    multiple: true,

    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2
        border-dashed
        rounded-xl
        p-10
        flex
        flex-col
        items-center
        justify-center
        cursor-pointer

        ${
          isDragActive
            ? "border-indigo-600 bg-indigo-50"
            : "border-slate-300"
        }
      `}
    >
      <input
        {...getInputProps()}
      />

      <ImagePlus className="w-12 h-12 mb-4 text-slate-400" />

      <p>
        Arraste imagens aqui
      </p>

      <span className="text-sm text-muted-foreground">
        ou clique para
        selecionar
      </span>
    </div>
  );
}