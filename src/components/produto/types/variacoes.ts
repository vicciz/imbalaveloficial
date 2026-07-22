import { supabase } from "../../../../supabaseClient";

export interface VariacaoTipo {
  id: number;
  nome: string;
}

export interface VariacaoValor {
  id: number;
  id_tipo: number;
  valor: string;
}

export interface ProdutoVariacao {
  id: number;
  id_produto: number;
  sku: string | null;
  preco: number | null;
  estoque: number;
  ativo: boolean;
}

export interface ProdutoVariacaoItem {
  id: number;
  id_variacao: number;
  id_valor: number;
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
      *,
      produto_variacao_item(
        *,
        variacao_valor(
          *,
          variacao_tipo(*)
        )
      )
    `)
    .eq("id_produto", idProduto);
}

export async function criarVariacaoProduto(
  idProduto: number,
  sku: string,
  preco: number,
  estoque: number
) {
  return await supabase
    .from("produto_variacao")
    .insert({
      id_produto: idProduto,
      sku,
      preco,
      estoque,
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
  idValor: number
) {
  return await supabase
    .from("produto_variacao_item")
    .insert({
      id_variacao: idVariacao,
      id_valor: idValor,
    });
}

export async function removerItemVariacao(
  idVariacao: number,
  idValor: number
) {
  return await supabase
    .from("produto_variacao_item")
    .delete()
    .eq("id_variacao", idVariacao)
    .eq("id_valor", idValor);
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

export async function excluirVariacoesProduto(
  idProduto: number
) {
  return await supabase
    .from("produto_variacao")
    .delete()
    .eq("id_produto", idProduto);
}


export async function salvarVariacao(
  id: number,
  dados: {
    sku: string;
    preco: number;
    estoque: number;
    ativo: boolean;
  }
) {
  const resposta = await supabase
    .from("produto_variacao")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  console.log(
    "SALVANDO",
    id,
    dados,
    resposta
  );

  return resposta;
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
