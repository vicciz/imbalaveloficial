"use client";

import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/supabaseClient";

import type {
  CJProduct,
} from "@/src/app/admin/fornecedores/cjdropshipping/components/types";

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

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      throw new Error("Sessão inválida. Faça login novamente.");
    }

    const response = await fetch(
      "/api/cj/import/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify(body),
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

  } catch (error: unknown) {

    console.error(error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Erro ao importar produto."
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