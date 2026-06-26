import { supabase } from "../../supabaseClient";
//listarImagensProduto(idProduto: number)
export async function listarImagensProduto(
  idProduto: number
) {
  return await supabase
    .from("produto_imagem")
    .select("*")
    .eq("id_produto", idProduto)
    .order("ordem");
}
//adicionarImagem(...)
export async function adicionarImagem(
  idProduto: number,
  caminho: string,
  ordem: number,
  principal = false
) {
  return await supabase
    .from("produto_imagem")
    .insert({
      id_produto: idProduto,
      caminho,
      ordem,
      principal,
    });
}
//removerImagem(...)
export async function excluirImagem(
  id: number
) {
  return await supabase
    .from("produto_imagem")
    .delete()
    .eq("id", id);
}
//definirPrincipal(...)
export async function definirImagemPrincipal(
  idProduto: number,
  idImagem: number
) {
  // Remove a principal atual
  await supabase
    .from("produto_imagem")
    .update({ principal: false })
    .eq("id_produto", idProduto);

  // Define a nova principal
  return await supabase
    .from("produto_imagem")
    .update({ principal: true })
    .eq("id", idImagem);
}