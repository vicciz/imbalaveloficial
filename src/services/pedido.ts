import { supabase } from "../../supabaseClient";

export async function criarPedido(
  idUsuario: string,
  valorTotal: number
) {
  return await supabase
    .from("pedido")
    .insert({
      id_usuario: idUsuario,
      valorTotal,
      status: "paid",
    })
    .select()
    .single();
}

export async function adicionarItemPedido(
  idPedido: number,
  idProduto: number,
  quantidade: number
) {
  return await supabase
    .from("pedidoItem")
    .insert({
      id_pedido: idPedido,
      id_produto: idProduto,
      quantidade,
    });
}

export async function buscarPedidosUsuario(
  userId: string
) {
  return await supabase
    .from("pedido")
    .select("*")
    .eq("id_usuario", userId);
}

export async function atualizarStatusPedido(
  idPedido: number,
  status: string
) {
  return await supabase
    .from("pedido")
    .update({ status })
    .eq("id", idPedido);
}

export async function excluirPedido(
  id: number
) {
  const { error } = await supabase
    .from("pedido")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}