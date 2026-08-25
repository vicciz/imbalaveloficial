"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { supabase } from "@/supabaseClient";
import { variantImageService } from "@/src/services/products/services/VariantImageService";

import {
  atualizarQuantidadeCarrinho,
  buscarCarrinho,
  removerDoCarrinho,
} from "@/src/services/carrinho/cart";

export function useCart() {

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [updatingIds, setUpdatingIds] =
    useState<number[]>([]);

  const [selectedItemIds, setSelectedItemIds] =
    useState<number[]>([]);

  function getAtributo(
    item: any,
    tipoNome: string
  ) {
    const chave =
      tipoNome
        .trim()
        .toLowerCase();

    return (
      item?.variacao?.produto_variacao_item
        ?.find(
          (registro: any) =>
            registro
              ?.variacao_valor
              ?.variacao_tipo
              ?.nome
              ?.trim()
              .toLowerCase() === chave
        )
        ?.variacao_valor?.valor ?? "-"
    );
  }

  function getPrecoUnitario(
    item: any
  ) {
    return Number(
      item?.variacao
        ?.produto_variacao_item?.[0]
        ?.preco ?? 0
    );
  }

  function getImagemItem(
    item: any
  ) {
    const imagens =
      item?.produto
        ?.produto_imagem ?? [];

    if (!imagens.length) {
      return (
        item?.produto?.image ??
        "/placeholder.png"
      );
    }

    const principal =
      variantImageService.getPrimaryImage(
        imagens,
        item?.variacao
      );

    return principal?.caminho
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/${principal.caminho}`
      : "/placeholder.png";
  }

  async function carregarCarrinho() {

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {

      setLoading(false);

      return;

    }

    const {
      data,
      error,
    } =
      await buscarCarrinho(
        user.id
      );

    if (error) {

      toast.error(
        "Não foi possível carregar o carrinho."
      );

      console.error(error);

      setLoading(false);

      return;

    }

    const itens =
      data ?? [];

    setCartItems(itens);

    setSelectedItemIds(
      (prev) => {

        const ids =
          new Set(
            itens.map(
              (i: any) =>
                Number(i.id)
            )
          );

        return prev.filter(
          (id) =>
            ids.has(id)
        );

      }
    );

    setLoading(false);

  }

  useEffect(() => {

    carregarCarrinho();

  }, []);

  async function remover(
    id: number
  ) {

    setUpdatingIds(
      (prev) => [
        ...prev,
        id,
      ]
    );

    const ok =
      await removerDoCarrinho(
        id
      );

    if (ok) {

      setSelectedItemIds(
        (prev) =>
          prev.filter(
            (i) =>
              i !== id
          )
      );

      await carregarCarrinho();

    }

    setUpdatingIds(
      (prev) =>
        prev.filter(
          (i) =>
            i !== id
        )
    );

  }

  async function alterarQuantidade(
    item: any,
    delta: number
  ) {

    const id =
      Number(item.id);

    const quantidade =
      Number(
        item.quantidade
      ) + delta;

    if (
      quantidade <= 0
    ) {

      return remover(id);

    }

    setUpdatingIds(
      (prev) => [
        ...prev,
        id,
      ]
    );

    await atualizarQuantidadeCarrinho(
      id,
      quantidade
    );

    await carregarCarrinho();

    setUpdatingIds(
      (prev) =>
        prev.filter(
          (i) =>
            i !== id
        )
    );

  }

  function alternarSelecaoItem(
    id: number
  ) {

    setSelectedItemIds(
      (prev) =>
        prev.includes(id)
          ? prev.filter(
              (i) =>
                i !== id
            )
          : [
              ...prev,
              id,
            ]
    );

  }

  function alternarSelecionarTodos() {

    const ids =
      cartItems.map(
        (i) =>
          Number(i.id)
      );

    const todos =
      ids.every(
        (id) =>
          selectedItemIds.includes(
            id
          )
      );

    setSelectedItemIds(
      todos
        ? []
        : ids
    );

  }

  return {

    cartItems,

    loading,

    updatingIds,

    selectedItemIds,

    carregarCarrinho,

    remover,

    alterarQuantidade,

    alternarSelecaoItem,

    alternarSelecionarTodos,

    setSelectedItemIds,

    getImagemItem,

    getPrecoUnitario,

    getAtributo,

  };

}