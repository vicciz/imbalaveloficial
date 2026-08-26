import { supabase } from "../../../supabaseClient";

export async function criarPedido(
  idUsuario: string,
  idEndereco: number,
  valorTotal: number,
  stripeSessionId?: string,
  freteDetalhes?: unknown
) {
  const { data: usuario } = await supabase
    .from("usuario")
    .select("documento_fiscal")
    .eq("user_id", idUsuario)
    .maybeSingle();

  return await supabase
    .from("pedido")
    .insert({
      id_usuario: idUsuario,
      id_endereco: idEndereco,
      valorTotal,
      status: "paid",
      ...(stripeSessionId ? { stripe_session_id: stripeSessionId } : {}),
      ...(freteDetalhes ? { frete_detalhes: freteDetalhes } : {}),
      ...(usuario?.documento_fiscal
        ? { documento_fiscal: usuario.documento_fiscal }
        : {}),
      cj_status: "pending",
    })
    .select()
    .single();
}

export async function buscarPedidoPorStripeSession(stripeSessionId: string) {
  return await supabase
    .from("pedido")
    .select("*")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle();
}

export async function buscarItensPedido(idPedido: number) {
  return await supabase
    .from("pedidoItem")
    .select(`
      id,
      id_produto,
      id_variacao,
      quantidade,
      preco_unitario,
      subtotal,
      produto (id, nome),
      variacao:produto_variacao (
        id,
        external_variant_id,
        produto_variacao_item (
          sku,
          fornecedor_sku,
          ativo,
          variacao_valor (valor, variacao_tipo (nome))
        )
      )
    `)
    .eq("id_pedido", idPedido);
}

export async function atualizarIntegracaoCJ(
  idPedido: number,
  dados: Record<string, unknown>
) {
  return await supabase
    .from("pedido")
    .update(dados)
    .eq("id", idPedido)
    .select()
    .single();
}

export async function adicionarItemPedido(
  idPedido: number,
  idProduto: number,
  quantidade: number,
  precoUnitario: number,
  idVariacao: number | null
) {
  return await supabase
    .from("pedidoItem")
    .insert({
      id_pedido: idPedido,
      id_produto: idProduto,
      id_variacao: idVariacao,
      quantidade,
      preco_unitario: precoUnitario,
      subtotal: precoUnitario * quantidade,
    });
}

export async function buscarPedidosUsuario(userId: string) {
const { data, error } = await supabase
  .from("pedido")
  .select(`
    *,
    pedidoItem (
      quantidade,
      preco_unitario,
      subtotal,
      id_variacao,

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
