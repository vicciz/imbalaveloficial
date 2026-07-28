"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

import DropArea from "./DropArea";
import ImagemCard from "./ImagemCard";

import {
  excluirImagem,
  excluirArquivoStorage,
} from "@/src/components/produto/types/produtoImagem";

import type {
  ImagemGaleria,
} from "./types";

interface Props {

  titulo?: string;

  imagens: ImagemGaleria[];

  setImagens: React.Dispatch<
    React.SetStateAction<
      ImagemGaleria[]
    >
  >;

  abrirCropper: (
    imagem: ImagemGaleria
  ) => void;

  idValor?: number | null;
}

export default function GaleriaImagens({

  titulo,

  imagens,

  setImagens,

  abrirCropper,

  idValor,

}: Props) {

  async function remover(
    imagem: ImagemGaleria
  ) {

    if (imagem.id) {

      if (imagem.caminho) {

        await excluirArquivoStorage(
          imagem.caminho
        );

      }

      await excluirImagem(
        imagem.id
      );

    }

    setImagens(
      (prev) =>
        prev.filter(
          (i) =>
            i !== imagem
        )
    );
  }

  function principal(
    index: number
  ) {

    setImagens(
      (prev) =>
        prev.map(
          (
            img,
            i
          ) => ({
            ...img,
            principal:
              i === index,
          })
        )
    );
  }

  return (
    <Card>

      <CardHeader>

        <CardTitle>
          {titulo ??
            "Galeria"}
        </CardTitle>

      </CardHeader>

      <CardContent>

        <DropArea
          imagens={imagens}
          idValor={idValor}
          onAdicionar={(
            novas
          ) =>
            setImagens(
              (
                prev
              ) => [
                ...prev,
                ...novas,
              ]
            )
          }
        />

        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-3
            xl:grid-cols-4
            gap-6
            mt-6
          "
        >

          {imagens.map(
            (
              imagem,
              index
            ) => (
              <ImagemCard
                key={
                  imagem.id ??
                  index
                }
                imagem={imagem}
                onEditar={() =>
                  abrirCropper(
                    imagem
                  )
                }
                onExcluir={() =>
                  remover(
                    imagem
                  )
                }
                onPrincipal={() =>
                  principal(
                    index
                  )
                }
              />
            )
          )}

        </div>

      </CardContent>

    </Card>
  );
}