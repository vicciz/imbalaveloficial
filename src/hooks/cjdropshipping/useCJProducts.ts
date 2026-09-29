"use client";

import { useState } from "react";

import type {
  CJProduct,
} from "@/src/app/admin/fornecedores/cjdropshipping/components/types";

export function useCJProducts() {
  const [busca, setBusca] = useState("");

  const [loading, setLoading] = useState(false);

  const [produtos, setProdutos] = useState<CJProduct[]>([]);

  async function pesquisar() {
    if (!busca.trim()) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/cj/search?keyword=${encodeURIComponent(busca)}`
      );

      const json = await response.json();

      const produtosCJ: CJProduct[] =
        json.data?.content?.[0]?.productList ?? [];

      // Busca a cotação atual do dólar
      const cambioResponse = await fetch("/api/cambio/usd-brl");

      if (!cambioResponse.ok) {
        throw new Error("Não foi possível obter a cotação do dólar.");
      }

      const cambio = await cambioResponse.json();

      const usdBrl = Number(
        cambio.rate ??
        cambio.usdBrl?.rate ??
        cambio.data?.rate ??
        0
      );

      if (!Number.isFinite(usdBrl) || usdBrl <= 0) {
        throw new Error("Cotação do dólar inválida.");
      }

      const produtosConvertidos = produtosCJ.map((produto) => {
        const precoDolar = Number(produto.sellPrice);

        return {
          ...produto,
          sellPriceBRL: Number(
            (precoDolar * usdBrl).toFixed(2)
          ),
        };
      });

      setProdutos(produtosConvertidos);
    } catch (error) {
      console.error(
        "Erro ao buscar produtos:",
        error
      );

      setProdutos([]);
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