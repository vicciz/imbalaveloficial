"use client";

import { useState } from "react";

import { toast } from "sonner";

import {
  importarCatalogo,
} from "@/src/services/importador";

import {
  lerProdutosExcel,
} from "@/src/services/importador/excel";

import {
  gerarPreview,
} from "@/src/services/importador/preview";

export function useImportadorProdutos() {

  const [arquivo, setArquivo] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [preview, setPreview] =
    useState<any[]>([]);

  const [mostrarPreview, setMostrarPreview] =
    useState(false);

  const [progresso, setProgresso] =
    useState(0);

  const [produtoAtual, setProdutoAtual] =
    useState("");

  const [totalProdutos, setTotalProdutos] =
        useState(0);
    
async function selecionarArquivo(
  event: React.ChangeEvent<HTMLInputElement>
) {

  const file =
    event.target.files?.[0];

  if (!file) return;

  setArquivo(file);

  if (
    file.name
      .toLowerCase()
      .endsWith(".xlsx")
  ) {

    try {

      const produtos =
        await lerProdutosExcel(
          file
        );

      const preview =
        await gerarPreview(
          produtos
        );

      setPreview(
        preview
      );

      setMostrarPreview(
        true
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Não foi possível ler a planilha."
      );

    }

  } else {

    setPreview([]);

    setMostrarPreview(false);

  }

    }
    
async function importar() {

  if (!arquivo) return;

  try {

    setLoading(true);

    setProgresso(0);

    const resultado =
      await importarCatalogo(

        arquivo,

        (
          atual,
          total,
          nome
        ) => {

          setProdutoAtual(
            nome
          );

          setTotalProdutos(
            total
          );

          setProgresso(
            Math.round(
              (atual * 100) /
              total
            )
          );

        }

      );

    toast.success(
      "Importação concluída!",
      {
        description:
          `${resultado.produtos} produtos importados.`,
      }
    );

    return resultado;

  } catch (error) {

    console.error(error);

    toast.error(
      "Erro ao importar catálogo",
      {
        description:
          error instanceof Error
            ? error.message
            : "Erro desconhecido",
      }
    );

  } finally {

    setLoading(false);

  }

}
  return {

    arquivo,

    loading,

    preview,

    mostrarPreview,

    progresso,

    produtoAtual,

    totalProdutos,

    selecionarArquivo,

    importar,

  };

}