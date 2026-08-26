import { supabase } from "@/supabaseClient";
import { podeCancelarPedido } from "@/src/lib/status-pedido";
import { estornarPagamentoPedido } from "@/src/services/stripe/refund";

export type RegistrarEventoPedidoInput = {
  pedidoId: number;
  tipo: string;
  statusAnterior?: string | null;
  statusNovo?: string | null;
  motivo?: string | null;
  dados?: Record<string, unknown> | null;
};

export async function registrarEventoPedido(input: RegistrarEventoPedidoInput) {
  return supabase.from("pedido_evento").insert({
    pedido_id: input.pedidoId,
    tipo: input.tipo,
    status_anterior: input.statusAnterior ?? null,
    status_novo: input.statusNovo ?? null,
    motivo: input.motivo ?? null,
    dados: input.dados ?? null,
  });
}

async function processarEstornoPedido(pedido: {
  id: number;
  status?: string | null;
  stripe_session_id?: string | null;
  stripe_refund_id?: string | null;
}) {
  try {
    const refund = await estornarPagamentoPedido(pedido);

    await supabase
      .from("pedido")
      .update({
        stripe_refund_id: refund.refundId,
        stripe_refund_status: refund.status,
        stripe_refunded_at: new Date().toISOString(),
        stripe_refund_error: null,
      })
      .eq("id", pedido.id);
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Erro desconhecido ao criar refund Stripe.";

    await supabase
      .from("pedido")
      .update({
        stripe_refund_status: "failed",
        stripe_refund_error: message.slice(0, 2000),
      })
      .eq("id", pedido.id);
  }
}

export async function cancelarPedido(
  pedidoId: number,
  options?: {
    motivo?: string | null;
    canceladoPor?: string | null;
  }
) {
  const { data: pedido, error: buscaError } = await supabase
    .from("pedido")
    .select("id, status")
    .eq("id", pedidoId)
    .single();

  if (buscaError || !pedido) {
    return {
      data: null,
      error: buscaError ?? new Error("Pedido não encontrado."),
    };
  }

  const statusAnterior = pedido.status ?? null;
  const motivo = options?.motivo?.trim() || null;
  const canceladoPor = options?.canceladoPor?.trim() || null;

  const resultado = await supabase
    .from("pedido")
    .update({
      status: "CANCELLED",
      cancelado_em: new Date().toISOString(),
      motivo_cancelamento: motivo,
      cancelado_por: canceladoPor,
    })
    .eq("id", pedidoId)
    .select()
    .single();

  if (resultado.error || !resultado.data) {
    return resultado;
  }

  await processarEstornoPedido(resultado.data);

  const evento = await registrarEventoPedido({
    pedidoId,
    tipo: "ORDER_CANCELLED",
    statusAnterior,
    statusNovo: "CANCELLED",
    motivo,
    dados: { cancelado_por: canceladoPor },
  });

  if (evento.error) {
    return {
      data: resultado.data,
      error: evento.error,
    };
  }

  return resultado;
}

export async function cancelarPedidoCliente(
  pedidoId: number,
  usuarioId: string,
  motivo: string
) {
  const motivoNormalizado = motivo.trim();
  if (!motivoNormalizado) {
    return { data: null, error: new Error("O motivo do cancelamento é obrigatório.") };
  }

  const { data: pedido, error: buscaError } = await supabase
    .from("pedido")
    .select("id, id_usuario, status, cj_status")
    .eq("id", pedidoId)
    .eq("id_usuario", usuarioId)
    .single();

  if (buscaError || !pedido) {
    return {
      data: null,
      error: buscaError ?? new Error("Pedido não encontrado."),
    };
  }

  if (!podeCancelarPedido(pedido.status, pedido.cj_status)) {
    return {
      data: null,
      error: new Error("Este pedido não pode mais ser cancelado."),
    };
  }

  const statusAnterior = pedido.status ?? null;
  const resultado = await supabase
    .from("pedido")
    .update({
      status: "CANCELLED",
      cancelado_em: new Date().toISOString(),
      motivo_cancelamento: motivoNormalizado,
      cancelado_por: usuarioId,
    })
    .eq("id", pedidoId)
    .eq("id_usuario", usuarioId)
    .select()
    .single();

  if (resultado.error || !resultado.data) {
    return resultado;
  }

  await processarEstornoPedido(resultado.data);

  const evento = await registrarEventoPedido({
    pedidoId,
    tipo: "ORDER_CANCELLED",
    statusAnterior,
    statusNovo: "CANCELLED",
    motivo: motivoNormalizado,
    dados: { cancelado_por: usuarioId },
  });

  if (evento.error) {
    return { data: resultado.data, error: evento.error };
  }

  return resultado;
}
