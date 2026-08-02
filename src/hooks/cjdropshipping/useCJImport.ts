"use client";

import { useState } from "react";
import { toast } from "sonner";

import type {
  CJProduct,
} from "@/src/app/admin/cjdropshipping/components/types";

export function useCJImport() {
  const [
    produtoSelecionado,
    setProdutoSelecionado,
  ] = useState<CJProduct | null>(null);

  const [loading, setLoading] =
    useState(false);

  function abrirImportacao(
    produto: CJProduct
  ) {
    setProdutoSelecionado(produto);
  }

  function fecharImportacao() {
    setProdutoSelecionado(null);
  }
async function importarProduto() {
  if (!produtoSelecionado) {
    console.log("Nenhum produto selecionado");
    return;
  }

  console.log("Produto:", produtoSelecionado);
  console.log("PID:", produtoSelecionado.id);

  const body = {
    pid: produtoSelecionado.id,
  };

  console.log("Body:", body);

  try {
    setLoading(true);

    const response = await fetch(
      "/api/cj/import",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({
  pid: produtoSelecionado.id,
})
      }
    );

    const json = await response.json();

    console.log(json);

    if (!response.ok) {
      throw new Error(
        json.message ??
          "Erro ao importar produto."
      );
    }

    toast.success(
      "Produto importado com sucesso!"
    );

    fecharImportacao();

    return json;

  } catch (error: any) {

    console.error(error);

    toast.error(
      error.message ??
      "Erro ao importar produto."
    );

  } finally {

    setLoading(false);

  }
}

  return {
    produtoSelecionado,

    loading,

    abrirImportacao,

    fecharImportacao,

    importarProduto,
  };
}