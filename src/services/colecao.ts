import { supabase } from "@/supabaseClient";
export interface colecao{
    id:number;
    nome:string;
}
//criar coleção
export async function createColecao(nome:string) {
    const {data, error} = await supabase
    .from('colecao')
    .insert({nome})
    .select("*")
    //"Retorne um único objeto, e não um array."
    .single()

    return {data,error}
}
//Adicionar um produto a uma coleção
export async function adicionarProdutoColecao(
  idColecao: number,
  idProduto: number
) {
  const { data, error } = await supabase
    .from("colecao_produto")
    .insert({
      colecao_id: idColecao,
      produto_id: idProduto,
    })
    .select()
    .single();

  return {
    data,
    error,
  };
}
//editar coleção


//Listar todas as coleções da tabela coleção
export async function listarColecoes(){
    const {data, error} = await supabase
    .from('colecao')
    .select();

    return {
    data,
    error
    }
}

//listar coleção por id
export async function listarProdutosColecao(idColecao: number) {
  const { data, error } = await supabase
    .from("colecao_produto")
    .select("produto_id")
    .eq("colecao_id", idColecao);

  return {
    data,
    error,
  };
}

//excluir coleção
export async function delColecao(idColecao: number) {
    const { data, error } = await supabase
    .from('colecao')
    .delete()
    .eq('id', idColecao)

    return {
    data,
    error
    }
}

//Remover produto da coleçao
export async function removerProdutoColecao(
  idColecao: number,
  idProduto: number
) {
  const { data, error } = await supabase
    .from("colecao_produto")
    .delete()
    .eq("colecao_id", idColecao)
    .eq("produto_id", idProduto);

  return {
    data,
    error,
  };
}