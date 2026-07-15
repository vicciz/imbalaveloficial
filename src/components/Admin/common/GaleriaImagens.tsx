"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  excluirImagem,
  excluirArquivoStorage,
} from "@/src/services/produto/produtoImagem";
import { Button } from "@/src/components/ui/button";

import {
  ImagePlus,
  Star,
  Pencil,
  Trash2,
} from "lucide-react";

import { GaleriaImagensProps } from "./types";

export default function GaleriaImagens({
  titulo,
  imagens,
  setImagens,
  abrirCropper,
  idValor,
}: GaleriaImagensProps) {
  const onDrop = useCallback(
    (files: File[]) => {
      const novas = files.map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        principal:
          imagens.length === 0 &&
          index === 0,
        ordem:
          imagens.length + index,

        idValor:
          idValor ?? null,
      }));

      setImagens((prev) => [
        ...prev,
        ...novas,
      ]);
    },
    [
      imagens,
      setImagens,
      idValor,
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

async function removerImagem(imagem: any) {
  try {
    if (imagem.id) {
      if (imagem.caminho) {
        await excluirArquivoStorage(
          imagem.caminho
        );
      }

      await excluirImagem(imagem.id);
    }

    setImagens((prev) => {
      const lista = prev.filter(
        (img) => img !== imagem
      );

      if (
        lista.length &&
        !lista.some((img) => img.principal)
      ) {
        lista[0].principal = true;
      }

      return lista.map((img, ordem) => ({
        ...img,
        ordem,
      }));
    });
  } catch (error) {
    console.error(error);
    alert("Erro ao excluir imagem.");
  }
}

  function definirPrincipal(
    ordem: number
  ) {
    setImagens((prev) =>
      prev.map((img, index) => ({
        ...img,
        principal:
          index === ordem,
      }))
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {titulo ??
            "Galeria de Imagens"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2
            border-dashed
            rounded-xl
            p-10
            transition
            cursor-pointer
            flex
            flex-col
            items-center
            justify-center
            mb-8

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

          <p className="font-medium">
            Arraste imagens aqui
          </p>

          <span className="text-sm text-muted-foreground">
            ou clique para
            selecionar
          </span>
        </div>

        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-3
            xl:grid-cols-4
            gap-6
          "
        >
          {imagens.map(
            (
              imagem,
              index
            ) => (
              <div
                key={index}
                className="
                  border
                  rounded-xl
                  overflow-hidden
                  bg-white
                "
              >
                <div
                  className="
                    relative
                    aspect-square
                    group
                  "
                >
                  <Image
                    src={
                      imagem.preview
                    }
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
                      onClick={() =>
                        abrirCropper(
                          imagem
                        )
                      }
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() =>
  removerImagem(imagem)
}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3">
                  <Button
                    variant={
                      imagem.principal
                        ? "default"
                        : "outline"
                    }
                    className="w-full"
                    onClick={() =>
                      definirPrincipal(
                        index
                      )
                    }
                  >
                    <Star className="w-4 h-4 mr-2" />

                    {imagem.principal
                      ? "Principal"
                      : "Definir Principal"}
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}