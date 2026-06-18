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
    existente.quantidade + qtd,
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
export async function buscarCarrinho() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("carrinho")
    .select(`
      id,
      quantidade,
      produto (
        id,
        nome,
        preco,
        image
      )
    `)
    .eq("id_user", user.id);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
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