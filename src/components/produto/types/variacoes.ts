import { supabase } from "../../../../supabaseClient";
import type { ProdutoVariacao, ProdutoVariacaoItem } from "./produtos";
  
export interface VariacaoTipo {
  id: number;
  nome: string;
}

export interface VariacaoValor {
  id: number;
  id_tipo: number;
  valor: string;
}

/* ===========================
   TIPOS
=========================== */

export async function listarTiposVariacao() {
  return await supabase
    .from("variacao_tipo")
    .select("*")
    .order("nome");
}

export async function criarTipoVariacao(
  nome: string
) {
  return await supabase
    .from("variacao_tipo")
    .insert({ nome })
    .select()
    .single();
}

export async function editarTipoVariacao(
  id: number,
  nome: string
) {
  return await supabase
    .from("variacao_tipo")
    .update({ nome })
    .eq("id", id)
    .select()
    .single();
}

export async function excluirTipoVariacao(
  id: number
) {
  return await supabase
    .from("variacao_tipo")
    .delete()
    .eq("id", id);
}

/* ===========================
   VALORES
=========================== */

export async function listarValoresTipo(
  idTipo: number
) {
  return await supabase
    .from("variacao_valor")
    .select("*")
    .eq("id_tipo", idTipo)
    .order("valor");
}

export async function criarValorVariacao(
  idTipo: number,
  valor: string
) {
  return await supabase
    .from("variacao_valor")
    .insert({
      id_tipo: idTipo,
      valor,
    })
    .select()
    .single();
}

export async function editarValorVariacao(
  id: number,
  valor: string
) {
  return await supabase
    .from("variacao_valor")
    .update({ valor })
    .eq("id", id)
    .select()
    .single();
}

export async function excluirValorVariacao(
  id: number
) {
  return await supabase
    .from("variacao_valor")
    .delete()
    .eq("id", id);
}

/* ===========================
   VARIAÇÕES DO PRODUTO
=========================== */

export async function listarVariacoesProduto(
  idProduto: number
) {
  return await supabase
  .from("produto_variacao")
  .select(`
    id,
    id_produto,

    produto_variacao_item(
      id,
      id_valor,

      preco,
      estoque,
      sku,
      ativo,
      imagem_principal,

      variacao_valor(
        id,
        valor,

        variacao_tipo(
          id,
          nome
        )
      )
    )
  `)
  .eq("id_produto", idProduto);;
}

export async function criarVariacaoProduto(
  idProduto: number,
) {
  return await supabase
    .from("produto_variacao")
    .insert({
      id_produto: idProduto,
    })
    .select()
    .single();
}

export async function editarVariacaoProduto(
  id: number,
  dados: Partial<ProdutoVariacao>
) {
  return await supabase
    .from("produto_variacao")
    .update(dados)
    .eq("id", id)
    .select()
    .single();
}

export async function excluirVariacaoProduto(
  id: number
) {
  return await supabase
    .from("produto_variacao")
    .delete()
    .eq("id", id);
}

/* ===========================
   ITENS DA VARIAÇÃO
=========================== */


export async function adicionarItemVariacao(
  idVariacao: number,
  idValor: number,
  sku: string,
  preco: number,
  estoque: number
) {
  return await supabase
    .from("produto_variacao_item")
    .insert({
      id_variacao: idVariacao,
      id_valor: idValor,
      sku,
      preco,
      estoque,
      ativo: true,
    });
}

export interface VariacaoTipoCompleta {
  id: number;
  nome: string;

  variacao_valor: VariacaoValor[];
}

export async function listarTiposVariacaoCompleto() {
  return await supabase
    .from("variacao_tipo")
    .select(`
      *,
      variacao_valor (
        *
      )
    `)
    .order("nome");
}

export async function buscarTipoVariacao(
  id: number
) {
  return await supabase
    .from("variacao_tipo")
    .select(`
      *,
      variacao_valor (
        *
      )
    `)
    .eq("id", id)
    .single();
}

export async function salvarValoresTipo(
  idTipo: number,
  valores: string[]
) {
  const registros = valores.map((valor) => ({
    id_tipo: idTipo,
    valor,
  }));

  return await supabase
    .from("variacao_valor")
    .insert(registros);
}

export async function salvarItemVariacao(
  idItem: number,
  dados: {
    preco: number;
    estoque: number;
    sku?: string;
    ativo: boolean;
    imagem_principal?: string | null;
  }
) {
  return await supabase
    .from("produto_variacao_item")
    .update(dados)
    .eq("id", idItem)
    .select()
    .single();
}

export async function excluirVariacoesProduto(
  idProduto: number
) {
  return await supabase
    .from("produto_variacao")
    .delete()
    .eq("id_produto", idProduto);
}

export async function listarTiposProduto(
  idProduto: number
) {
  return await supabase
    .from("produto_variacao_tipo")
    .select("id_tipo")
    .eq("id_produto", idProduto);
}

export async function adicionarTipoProduto(
  idProduto: number,
  idTipo: number
) {
  return await supabase
    .from("produto_variacao_tipo")
    .insert({
      id_produto: idProduto,
      id_tipo: idTipo,
    });
}

export async function removerTipoProduto(
  idProduto: number,
  idTipo: number
) {
  return await supabase
    .from("produto_variacao_tipo")
    .delete()
    .eq("id_produto", idProduto)
    .eq("id_tipo", idTipo);
}

export async function criarItensVariacao(
  idVariacao: number,
  idsValores: number[]
) {
  const registros = idsValores.map((idValor) => ({
    id_variacao: idVariacao,
    id_valor: idValor,
  }));

  return await supabase
    .from("produto_variacao_item")
    .insert(registros);
}

