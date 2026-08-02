"use client";

import { useState } from "react";

import type {
  CJProduct,
} from "@/src/app/admin/cjdropshipping/components/types";

export function useCJProducts() {
  const [busca, setBusca] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [produtos, setProdutos] =
    useState<CJProduct[]>([]);

  async function pesquisar() {
    if (!busca.trim()) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/cj/search?keyword=${encodeURIComponent(
          busca
        )}`
      );

      const json = await response.json();

      setProdutos(
        json.data?.content?.[0]?.productList ??
          []
      );
    } catch (error) {
      console.error(
        "Erro ao buscar produtos:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    busca,
    setBusca,

    loading,

    produtos,

    pesquisar,
  };
}