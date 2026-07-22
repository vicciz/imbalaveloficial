import { supabase } from "@/supabaseClient";
import type { VitrineSecao } from "./types";
import {
  buscarProdutosPorIds,
  listarProdutosCategoria,
  listarProdutosPorColecao,
} from "@/src/services/produto/produtos";

/* ============================
   LISTAR
============================ */

export async function listarVitrines() {

  return await supabase

    .from("vitrine_secao")

    .select("*")

    .eq("ativo", true)

    .order("ordem", {
      ascending: true,
    });

}

/* ============================
   BUSCAR POR ID
============================ */

export async function buscarVitrine(id: number) {

  const { data, error } = await supabase
    .from("vitrine_secao")
    .select("*")
    .eq("id", id)
    .single();

  return {
    data: data as VitrineSecao | null,
    error,
  };

}

/* ============================
   INSERIR
============================ */

export async function inserirVitrine(
  vitrine: Omit<VitrineSecao, "id">
) {

  const { data, error } = await supabase
    .from("vitrine_secao")
    .insert(vitrine)
    .select()
    .single();

  return {
    data,
    error,
  };

}

/* ============================
   ATUALIZAR
============================ */

export async function atualizarVitrine(
  id: number,
  vitrine: Partial<VitrineSecao>
) {

  const { data, error } = await supabase
    .from("vitrine_secao")
    .update(vitrine)
    .eq("id", id)
    .select()
    .single();

  return {
    data,
    error,
  };

}

/* ============================
   EXCLUIR
============================ */

export async function excluirVitrine(id: number) {

  const { error } = await supabase
    .from("vitrine_secao")
    .delete()
    .eq("id", id);

  return {
    error,
  };

}

export async function alterarStatusVitrine(
  id: number,
  ativo: boolean
) {

  return await supabase
    .from("vitrine_secao")
    .update({ ativo })
    .eq("id", id)
    .select()
    .single();

}

export async function listarProdutosDaVitrine(
  vitrine: VitrineSecao
) {

  /* ==========================
     CATEGORIA
  ========================== */

  if (vitrine.tipo === "categoria") {

    return await listarProdutosCategoria(
      Number(vitrine.referencia),
      vitrine.quantidade
    );

  }

  /* ==========================
     COLEÇÃO
  ========================== */

  if (vitrine.tipo === "colecao") {

    return await listarProdutosPorColecao(
      Number(vitrine.referencia)
    );

  }

  /* ==========================
     PRODUTOS MANUAIS
  ========================== */

  if (vitrine.tipo === "produtos") {

    const { data, error } = await supabase

      .from("vitrine_secao_produto")

      .select("produto_id")

      .eq("secao_id", vitrine.id)

      .order("ordem");

    if (error) {

      return {

        data: null,

        error,

      };

    }

    const ids =
      data.map(item => item.produto_id);

    return await buscarProdutosPorIds(ids);

  }

  return {

    data: [],

    error: null,

  };

}