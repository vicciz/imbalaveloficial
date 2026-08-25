"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

type FreteGrupo = {
  key: string;
  provider: string;
  international: boolean;
  originCountryCode: string;
  originCountryName?: string | null;
  serviceCode: string;
  serviceName: string;
  deliveryTime: string | null;
  priceBRL: number;
  items: Array<{
    produtoId: number | null;
    produtoNome: string;
    quantidade: number;
    variantId: string | null;
    variantSku: string | null;
  }>;
};

type Props = {
  itens: any[];
  selectedItemIds: number[];
  enderecoId: number | null;
};

function numero(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function useFreteCarrinho({
  itens,
  selectedItemIds,
  enderecoId,
}: Props) {
  const [frete, setFrete] = useState<FreteGrupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function calcular() {
      if (!enderecoId || selectedItemIds.length === 0) {
        setFrete([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data: endereco, error: enderecoError } = await supabase
          .from("enderecos")
          .select("id, cep")
          .eq("id", enderecoId)
          .maybeSingle();

        if (enderecoError) {
          throw new Error("Não foi possível obter o endereço selecionado.");
        }

        const cepDestino = String(endereco?.cep ?? "").replace(/\D/g, "");

        if (cepDestino.length !== 8) {
          throw new Error("O endereço selecionado não possui um CEP válido.");
        }

        const selecionados = itens.filter((item) =>
          selectedItemIds.includes(Number(item.id))
        );

        const payloadItens = selecionados.map((item) => {
          const variacao = item?.variacao;
          const itemVariacao =
            variacao?.produto_variacao_item?.find(
              (registro: any) => registro?.ativo !== false
            ) ?? null;

          return {
            produtoId: Number(item.id_produto ?? item.produto?.id),
            quantidade: Math.max(1, numero(item.quantidade)),
            preco: numero(itemVariacao?.preco ?? variacao?.preco ?? item.produto?.preco),
            variantId:
              variacao?.external_variant_id ??
              variacao?.cj_variant_id ??
              variacao?.fornecedor_sku ??
              itemVariacao?.fornecedor_sku ??
              null,
            variantSku: variacao?.sku ?? itemVariacao?.sku ?? null,
            variantItemId: itemVariacao?.id ?? null,
          };
        });

        const response = await fetch("/api/frete/cotacao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cepDestino,
            itens: payloadItens,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error ?? "Não foi possível calcular o frete.");
        }

        const grupos = Array.isArray(data?.grupos)
          ? data.grupos.map((grupo: any) => ({
              ...grupo,
              priceBRL: numero(grupo?.priceBRL),
            }))
          : [];

        if (!cancelado) {
          setFrete(grupos);
        }
      } catch (e) {
        if (!cancelado) {
          setFrete([]);
          setError(
            e instanceof Error
              ? e.message
              : "Não foi possível calcular o frete."
          );
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    }

    calcular();

    return () => {
      cancelado = true;
    };
  }, [enderecoId, itens, selectedItemIds]);

  const total = Number(
    frete.reduce((sum, item) => sum + numero(item.priceBRL), 0).toFixed(2)
  );

  return { frete, total, loading, error };
}
