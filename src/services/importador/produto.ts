import { supabase } from "@/supabaseClient";

import type {
  ProdutoImportacao,
} from "./types";

import {
  obterCategoriaId,
} from "./categoria";

import {
  obterMarcaId,
} from "./marca";

import {
  obterFornecedorId,
} from "./fornecedor";

export async function criarProdutoImportado(
  item: ProdutoImportacao
) {

  const categoriaId =
    await obterCategoriaId(
      item.categoria
    );

  const marcaId =
    await obterMarcaId(
      item.marca
    );

  const fornecedorId =
    await obterFornecedorId(
      item.fornecedor
    );

  const {
    data: existente,
    error: erroBusca,
  } =
    await supabase

      .from("produto")

      .select("id")

      .eq("nome", item.nome)

      .maybeSingle();

  if (erroBusca) {

    throw erroBusca;

  }

  // ===========================
  // PRODUTO JÁ EXISTE
  // ===========================

  if (existente) {

    const { error: erroUpdate } =
      await supabase

        .from("produto")

        .update({

          descricao:
            item.descricao,

          detalhes:
            item.detalhes,

          categoria_id:
            categoriaId,

          marca_id:
            marcaId,

          id_fornecedor:
            fornecedorId,

          fornecedor:
            item.fornecedor,

          destaque:
            item.destaque,

          oculto:
            item.oculto ?? false,

          link:
            item.link ?? "",

        })

        .eq(
          "id",
          existente.id
        );

    if (erroUpdate) {

      throw erroUpdate;

    }

    return existente.id;

  }

  // ===========================
  // NOVO PRODUTO
  // ===========================

  const {
    data,
    error,
  } =
    await supabase

      .from("produto")

      .insert({

        nome:
          item.nome,

        descricao:
          item.descricao,

        detalhes:
          item.detalhes,

        categoria_id:
          categoriaId,

        marca_id:
          marcaId,

        id_fornecedor:
          fornecedorId,

        fornecedor:
          item.fornecedor,

        destaque:
          item.destaque,

        oculto:
          item.oculto ?? false,

        link:
          item.link ?? "",

        rating:
          0,

        reviews:
          0,

      })

      .select("id")

      .single();

  if (error) {

    throw error;

  }

  return data.id;

}