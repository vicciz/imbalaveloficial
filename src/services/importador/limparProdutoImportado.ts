import { supabase } from "@/supabaseClient";

export async function limparProdutoImportado(
  idProduto: number
) {
  // Buscar as variações do produto
  const {
    data: variacoes,
    error: erroBusca,
  } = await supabase
    .from("produto_variacao")
    .select("id")
    .eq("id_produto", idProduto);

  if (erroBusca) {
    throw erroBusca;
  }

  // Excluir itens das variações
  if (variacoes && variacoes.length > 0) {
    const ids = variacoes.map(v => v.id);

    const {
      error: erroItens,
    } = await supabase
      .from("produto_variacao_item")
      .delete()
      .in("id_variacao", ids);

    if (erroItens) {
      throw erroItens;
    }
  }

  // Excluir variações
  const {
    error: erroVariacoes,
  } = await supabase
    .from("produto_variacao")
    .delete()
    .eq("id_produto", idProduto);

  if (erroVariacoes) {
    throw erroVariacoes;
  }

  // Excluir especificações
  const {
    error: erroEspecificacoes,
  } = await supabase
    .from("produto_especificacao")
    .delete()
    .eq("id_produto", idProduto);

  if (erroEspecificacoes) {
    throw erroEspecificacoes;
  }

  // Excluir imagens
  const {
    error: erroImagens,
  } = await supabase
    .from("produto_imagem")
    .delete()
    .eq("id_produto", idProduto);

  if (erroImagens) {
    throw erroImagens;
  }
}