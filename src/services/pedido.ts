import { supabase } from "../../supabaseClient";

export async function criarPedido(
  idUsuario: string,
  idEndereco: number,
  valorTotal: number
) {
  return await supabase
    .from("pedido")
    .insert({
      id_usuario: idUsuario,
      id_endereco: idEndereco,
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

export async function buscarPedidosUsuario(userId: string) {
  const { data, error } = await supabase
    .from("pedido")
    .select(`
      *,
      pedidoItem (
        quantidade,
        produto (
          id,
          nome,
          preco,
          produto_imagem (
            caminho,
            principal,
            ordem
          )
        )
      )
    `)
    .eq("id_usuario", userId);

  const pedidos = data?.map((pedido) => ({
    ...pedido,
    pedidoItem: pedido.pedidoItem.map((item: any) => {
      const imagens =
        item.produto.produto_imagem?.sort(
          (a: any, b: any) => a.ordem - b.ordem
        ) ?? [];

      const principal =
        imagens.find((img: any) => img.principal) ?? imagens[0];

      return {
        ...item,
        produto: {
          ...item.produto,
          image: principal
            ? supabase.storage
                .from("produtos")
                .getPublicUrl(principal.caminho).data.publicUrl
            : "",
        },
      };
    }),
  }));

  return {
    data: pedidos,
    error,
  };
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