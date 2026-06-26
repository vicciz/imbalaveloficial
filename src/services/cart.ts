import { supabase } from "../../supabaseClient";

export async function adicionarAoCarrinho(
  productId: number,
  userId: string,
  qtd: number
) {
  
const { data: existente } = await supabase
  .from("carrinho")
  .select("*")
  .eq("id_user", userId)
  .eq("id_produto", productId)
  .single();

if (existente) {
  const novaQuantidade = Math.min(
  Number(existente.quantidade) + Number(qtd),
  30
);
  
  await supabase
    .from("carrinho")
    .update({
      quantidade: novaQuantidade,
    })
    .eq("id", existente.id);

  return;
}

  await supabase
    .from("carrinho")
    .insert({
      id_user: userId,
      id_produto: productId,
      quantidade: Math.min(qtd, 30),
    });
}


//buscar cart
export async function buscarCarrinho(
  userId: string
) {
  return await supabase
    .from("carrinho")
    .select(`
      *,
      produto (*)
    `)
    .eq("id_user", userId);
}
export async function removerDoCarrinho(id: number) {
  const { error } = await supabase
    .from("carrinho")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

export function calcularTotal(itens: any[]) {
  return itens.reduce(
    (acc, item) =>
      acc +
      Number(item.produto.preco) *
        Number(item.quantidade),
    0
  );
}

export async function limparCarrinho(userId: string) {
  const { error } = await supabase
    .from("carrinho")
    .delete()
    .eq("id_user", userId);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}