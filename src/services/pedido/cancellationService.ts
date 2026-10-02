import "server-only";

import { podeCancelarPedido } from "@/src/lib/status-pedido";
import { estornarPagamentoPedido } from "@/src/services/stripe/refund";
import { getSupabaseAdminClient } from "@/src/services/supabaseAdmin";
import { cancelarPedidoCJ, type CjCancellationResult } from "@/src/services/cjdropshipping/cancelOrder";
import { enviarEmailCancelamentoPedido } from "@/src/services/email/cancelamentoPedidoEmail";
import { buscarItensPedido } from "@/src/services/pedido/pedido";

const CANCELAMENTO_LOCK_TIMEOUT_MS = 10 * 60 * 1000;

export type RegistrarEventoPedidoInput = {
  pedidoId: number;
  tipo: string;
  statusAnterior?: string | null;
  statusNovo?: string | null;
  motivo?: string | null;
  dados?: Record<string, unknown> | null;
};

type PedidoCancelamento = {
  id: number;
  id_usuario: string;
  created_at: string;
  status: string | null;
  cj_status: string | null;
  cj_order_id: string | null;
  cj_order_ids: unknown[] | null;
  valorTotal: number | string | null;
  stripe_session_id: string | null;
  stripe_refund_id: string | null;
  stripe_refund_status: string | null;
  cancelado_em: string | null;
  motivo_cancelamento: string | null;
  cancelado_por: string | null;
  cancelamento_em_andamento: boolean;
  cancelamento_inicio_em: string | null;
  cj_cancelamento_resultados: Record<string, unknown>;
  cancelamento_email_tentado_em: string | null;
  cancelamento_email_enviado_em: string | null;
};

type CjResultRecord = CjCancellationResult & { completedAt: string };

export async function registrarEventoPedido(input: RegistrarEventoPedidoInput) {
  return getSupabaseAdminClient().from("pedido_evento").insert({
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
  if (pedido.stripe_refund_id?.trim()) {
    console.info("[STRIPE] Refund:", pedido.stripe_refund_id.trim());
    return { refundId: pedido.stripe_refund_id.trim(), status: "already_refunded" };
  }

  if (!pedido.stripe_session_id?.trim()) {
    console.info("[STRIPE] Refund: não aplicável; pedido sem sessão de pagamento");
    return { refundId: null, status: "not_applicable" };
  }

  try {
    const refund = await estornarPagamentoPedido({
      ...pedido,
      status: "cancelled",
    });

    if (!refund.refundId) {
      const { error } = await getSupabaseAdminClient()
        .from("pedido")
        .update({
          stripe_refund_status: refund.status,
          stripe_refund_error: null,
        })
        .eq("id", pedido.id);

      if (error) {
        throw new Error(`Não foi possível registrar o refund não aplicável: ${error.message}`);
      }

      console.info("[STRIPE] Refund:", refund.status);
      return refund;
    }

    const { error } = await getSupabaseAdminClient()
      .from("pedido")
      .update({
        stripe_refund_id: refund.refundId,
        stripe_refund_status: refund.status,
        stripe_refunded_at: new Date().toISOString(),
        stripe_refund_error: null,
      })
      .eq("id", pedido.id);

    if (error) {
      throw new Error(`Refund criado, mas não foi possível salvar o ID: ${error.message}`);
    }

    console.info("[STRIPE] Refund:", refund.refundId);
    return refund;
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Erro desconhecido ao criar refund Stripe.";

    const { error: updateError } = await getSupabaseAdminClient()
      .from("pedido")
      .update({
        stripe_refund_status: "failed",
        stripe_refund_error: message.slice(0, 2000),
      })
      .eq("id", pedido.id);

    console.error("[CANCELAMENTO] Etapa STRIPE falhou:", message);
    if (updateError) {
      console.error("[STRIPE] Falha ao registrar erro do refund:", updateError.message);
    }
    throw error;
  }
}

function obterCjOrderIds(pedido: Pick<PedidoCancelamento, "cj_order_id" | "cj_order_ids">) {
  const ids = (pedido.cj_order_ids ?? [])
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") return String(item).trim();
      if (item && typeof item === "object") {
        return String((item as Record<string, unknown>).orderId ?? "").trim();
      }
      return "";
    })
    .filter(Boolean);

  if (pedido.cj_order_id?.trim()) ids.push(pedido.cj_order_id.trim());
  return [...new Set(ids)];
}

async function adquirirLockCancelamento(pedidoId: number) {
  const iniciadoEm = new Date();
  const expiradoEm = new Date(iniciadoEm.getTime() - CANCELAMENTO_LOCK_TIMEOUT_MS).toISOString();
  const { data, error } = await getSupabaseAdminClient()
    .from("pedido")
    .update({
      cancelamento_em_andamento: true,
      cancelamento_inicio_em: iniciadoEm.toISOString(),
    })
    .eq("id", pedidoId)
    .or(`cancelamento_em_andamento.eq.false,cancelamento_em_andamento.is.null,cancelamento_inicio_em.lt.${expiradoEm}`)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(`Não foi possível iniciar o cancelamento: ${error.message}`);
  if (!data) throw new Error("Já existe um cancelamento deste pedido em andamento.");
  return iniciadoEm.toISOString();
}

async function processarCancelamentoCJ(pedido: PedidoCancelamento, lockToken: string) {
  const ids = obterCjOrderIds(pedido);
  if (!ids.length) {
    console.info("[CJ] CJ order ID: não informado");
    console.info("[CJ] Ação: nenhuma");
    console.info("[CJ] Resultado: pedido local sem vínculo de pedido CJ");
    return;
  }

  const resultados = { ...(pedido.cj_cancelamento_resultados ?? {}) } as Record<string, CjResultRecord>;

  const persistirResultados = async () => {
    const { data, error } = await getSupabaseAdminClient()
      .from("pedido")
      .update({ cj_cancelamento_resultados: resultados })
      .eq("id", pedido.id)
      .eq("cancelamento_em_andamento", true)
      .eq("cancelamento_inicio_em", lockToken)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      throw new Error(`Falha ao persistir resultado CJ: ${error?.message ?? "lock expirado"}`);
    }
  };

  for (const cjOrderId of ids) {
    if (resultados[cjOrderId]) {
      const resultadoAnterior = resultados[cjOrderId].result === "delete_pending"
        ? "exclusão iniciada anteriormente; não será repetida automaticamente"
        : "etapa já concluída anteriormente";
      console.info("[CJ] Resultado: " + resultadoAnterior, { cjOrderId });
      continue;
    }

    const resultado = await cancelarPedidoCJ(cjOrderId, {
      beforeDelete: async (status) => {
        resultados[cjOrderId] = {
          status,
          action: "DELETE",
          result: "delete_pending",
          completedAt: new Date().toISOString(),
        };
        await persistirResultados();
      },
    });
    resultados[cjOrderId] = { ...resultado, completedAt: new Date().toISOString() };
    await persistirResultados();
  }
}

async function garantirEventoCancelamento(
  pedido: PedidoCancelamento,
  statusAnterior: string | null,
  motivo: string | null,
  canceladoPor: string | null,
  canceladoPorTipo: "cliente" | "administrador"
) {
  const { data: existente, error: buscaError } = await getSupabaseAdminClient()
    .from("pedido_evento")
    .select("id")
    .eq("pedido_id", pedido.id)
    .eq("tipo", "ORDER_CANCELLED")
    .maybeSingle();

  if (buscaError) throw new Error(`Falha ao consultar evento: ${buscaError.message}`);
  if (existente) return;

  const evento = await registrarEventoPedido({
    pedidoId: pedido.id,
    tipo: "ORDER_CANCELLED",
    statusAnterior,
    statusNovo: "cancelled",
    motivo,
    dados: {
      cancelado_por: canceladoPor,
      cancelado_por_tipo: canceladoPorTipo,
    },
  });
  if (evento.error && evento.error.code !== "23505") {
    throw new Error(`Falha ao registrar ORDER_CANCELLED: ${evento.error.message}`);
  }
}

async function enviarEmailCancelamento(
  pedido: PedidoCancelamento,
  refundId: string | null,
  refundStatus: string | null
) {
  if (pedido.cancelamento_email_tentado_em || pedido.cancelamento_email_enviado_em) {
    console.info("[EMAIL] Envio de cancelamento já tentado para este pedido:", pedido.id);
    return;
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(pedido.id_usuario);
  if (error) throw new Error(`Falha ao buscar e-mail do cliente: ${error.message}`);

  const email = data.user?.email?.trim();
  if (!email) throw new Error("O cliente do pedido não possui e-mail cadastrado.");

  const { data: itens, error: itensError } = await buscarItensPedido(pedido.id);
  if (itensError) throw new Error(`Falha ao buscar produtos do pedido: ${itensError.message}`);

  const { data: tentativa, error: tentativaError } = await supabaseAdmin
    .from("pedido")
    .update({ cancelamento_email_tentado_em: new Date().toISOString() })
    .eq("id", pedido.id)
    .is("cancelamento_email_tentado_em", null)
    .select("id")
    .maybeSingle();

  if (tentativaError) throw new Error(`Falha ao reservar envio de e-mail: ${tentativaError.message}`);
  if (!tentativa) return;

  await enviarEmailCancelamentoPedido({
    to: email,
    pedidoId: pedido.id,
    motivo: pedido.motivo_cancelamento,
    valorTotal: Number(pedido.valorTotal ?? 0),
    itens: itens ?? [],
    refundId,
    refundStatus,
    canceladoEm: pedido.cancelado_em ?? new Date().toISOString(),
  });

  const { error: updateError } = await supabaseAdmin
    .from("pedido")
    .update({ cancelamento_email_enviado_em: new Date().toISOString() })
    .eq("id", pedido.id);

  if (updateError) {
    console.error("[EMAIL] Enviado, mas falhou salvar o marcador:", updateError.message);
  }
  console.info("[EMAIL] E-mail de cancelamento enviado para:", email);
}

async function executarCancelamento(
  pedido: PedidoCancelamento,
  options: {
    motivo: string | null;
    canceladoPor: string | null;
    canceladoPorTipo: "cliente" | "administrador";
    usuarioId?: string;
  }
) {
  const supabaseAdmin = getSupabaseAdminClient();
  let lockToken: string | null = null;
  let etapa = "LOCK";

  try {
    lockToken = await adquirirLockCancelamento(pedido.id);
    const { data: pedidoAtualizado, error: leituraError } = await supabaseAdmin
      .from("pedido")
      .select("*")
      .eq("id", pedido.id)
      .single();

    if (leituraError || !pedidoAtualizado) {
      throw new Error(`Falha ao reler pedido após adquirir lock: ${leituraError?.message ?? "pedido não retornado"}`);
    }

    const pedidoAtual = pedidoAtualizado as PedidoCancelamento;
    const jaCancelado = String(pedidoAtual.status ?? "").trim().toLowerCase() === "cancelled";

    if (!jaCancelado) {
      console.info("[CANCELAMENTO] Pedido local:", pedidoAtual.id);
      etapa = "CJ";
      await processarCancelamentoCJ(pedidoAtual, lockToken);
    }

    let pedidoCancelado = pedidoAtual;
    if (!jaCancelado) {
      etapa = "PEDIDO";
      const { data, error } = await supabaseAdmin
        .from("pedido")
        .update({
          status: "cancelled",
          cancelado_em: new Date().toISOString(),
          motivo_cancelamento: options.motivo,
          cancelado_por: options.canceladoPor,
        })
        .eq("id", pedidoAtual.id)
        .eq("id_usuario", options.usuarioId ?? pedidoAtual.id_usuario)
        .eq("cancelamento_em_andamento", true)
        .eq("cancelamento_inicio_em", lockToken)
        .select("*")
        .single();

      if (error || !data) {
        throw new Error(`Falha ao atualizar pedido local: ${error?.message ?? "pedido não retornado"}`);
      }
      pedidoCancelado = data as PedidoCancelamento;
    }

    etapa = "STRIPE";
    const refund = await processarEstornoPedido({
      ...pedidoCancelado,
      status: "cancelled",
    });

    etapa = "EVENTO";
    await garantirEventoCancelamento(
      pedidoCancelado,
      pedidoAtual.status,
      pedidoCancelado.motivo_cancelamento ?? options.motivo,
      pedidoCancelado.cancelado_por ?? options.canceladoPor,
      options.canceladoPorTipo
    );

    try {
      etapa = "EMAIL";
      await enviarEmailCancelamento(pedidoCancelado, refund.refundId, refund.status);
    } catch (error) {
      console.error("[CANCELAMENTO] Etapa EMAIL falhou; cancelamento mantido:", {
        pedidoId: pedidoAtual.id,
        error: error instanceof Error ? error.message : error,
      });
    }

    return { data: pedidoCancelado, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido no cancelamento.";
    console.error(`[CANCELAMENTO] Etapa ${etapa} falhou:`, { pedidoId: pedido.id, error: message });
    return { data: null, error: error instanceof Error ? error : new Error(message) };
  } finally {
    if (lockToken) {
      const { error } = await supabaseAdmin
        .from("pedido")
        .update({ cancelamento_em_andamento: false, cancelamento_inicio_em: null })
        .eq("id", pedido.id)
        .eq("cancelamento_inicio_em", lockToken);
      if (error) {
        console.error("[CANCELAMENTO] Falha ao liberar lock:", { pedidoId: pedido.id, error: error.message });
      }
    }
  }
}

export async function cancelarPedido(
  pedidoId: number,
  options?: {
    motivo?: string | null;
    canceladoPor?: string | null;
  }
) {
  const { data: pedido, error: buscaError } = await getSupabaseAdminClient()
    .from("pedido")
    .select("*")
    .eq("id", pedidoId)
    .single();

  if (buscaError || !pedido) {
    return {
      data: null,
      error: buscaError ?? new Error("Pedido não encontrado."),
    };
  }

  const motivo = options?.motivo?.trim() || null;
  const canceladoPor = options?.canceladoPor?.trim() || null;
  return executarCancelamento(pedido as PedidoCancelamento, {
    motivo,
    canceladoPor,
    canceladoPorTipo: "administrador",
  });
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

  const { data: pedido, error: buscaError } = await getSupabaseAdminClient()
    .from("pedido")
    .select("*")
    .eq("id", pedidoId)
    .eq("id_usuario", usuarioId)
    .single();

  if (buscaError || !pedido) {
    return {
      data: null,
      error: buscaError ?? new Error("Pedido não encontrado."),
    };
  }

  const statusPedidoNormalizado = String(pedido.status ?? "").trim().toLowerCase();
  const statusCJNormalizado = String(pedido.cj_status ?? "").trim().toLowerCase();

  console.info("[cancelarPedidoCliente] status antes da validação", {
    "pedido.status": pedido.status,
    "pedido.cj_status": pedido.cj_status,
    statusPedidoNormalizado,
    statusCJNormalizado,
  });

  const jaCancelado = String(pedido.status ?? "").trim().toLowerCase() === "cancelled";
  const podeCancelar = jaCancelado || podeCancelarPedido(pedido.status, pedido.cj_status);
  console.info("[cancelarPedidoCliente] resultado da validação", {
    resultado: podeCancelar,
  });

  if (!podeCancelar) {
    return {
      data: null,
      error: new Error("Este pedido não pode mais ser cancelado."),
    };
  }

  return executarCancelamento(pedido as PedidoCancelamento, {
    motivo: motivoNormalizado,
    canceladoPor: usuarioId,
    canceladoPorTipo: "cliente",
    usuarioId,
  });
}
