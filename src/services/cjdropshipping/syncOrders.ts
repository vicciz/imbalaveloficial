import { supabase } from "@/supabaseClient";
import { buscarStatusPedido } from "./status";
import { buscarTrackingPedido } from "./tracking";
import { registrarNotificacaoCJ } from "./notifications";

type CjOrderStatusData = {
  orderStatus?: string | null;
  orderId?: string | number | null;
  cjOrderCode?: string | null;
  trackNumber?: string | null;
  trackingProvider?: string | null;
  trackingUrl?: string | null;
};

async function registrarHistoricoCJ(dados: {
  pedidoId: number;
  cjOrderId: string;
  statusAnterior: string | null;
  statusNovo?: string | null;
  trackingCode?: string | null;
  erro?: string | null;
}) {
  const { error } = await supabase.from("cj_sync_log").insert({
    pedido_id: dados.pedidoId,
    cj_order_id: dados.cjOrderId,
    status_anterior: dados.statusAnterior,
    status_novo: dados.statusNovo ?? null,
    tracking_code: dados.trackingCode ?? null,
    erro: dados.erro ?? null,
  });

  if (error) {
    console.error("[CJ SYNC] Falha ao registrar histórico:", {
      pedidoId: dados.pedidoId,
      error: error.message,
    });
  }
}

export async function sincronizarPedidoCJ(pedido: {
  id: number;
  cj_order_id?: string | null;
  cj_status?: string | null;
  cj_tracking_code?: string | null;
  codigo_rastreio?: string | null;
}) {
  const status = String(pedido.cj_status ?? "").trim().toUpperCase();
  if (status === "DELIVERED" || status === "CANCELLED") {
    return { data: pedido, error: null };
  }

  const cjOrderId = String(pedido.cj_order_id ?? "").trim();
  const statusAnterior = pedido.cj_status ?? null;

  if (!cjOrderId) {
    throw new Error("O pedido não possui cj_order_id.");
  }

  try {
    const resposta = await buscarStatusPedido(cjOrderId);
    const dados = (resposta.data ?? {}) as CjOrderStatusData;
    const respostaTracking = await buscarTrackingPedido(cjOrderId);
    console.log("[CJ TRACKING] resposta CJ:", respostaTracking);

    const dadosTracking = (respostaTracking.data ?? {}) as Record<string, unknown>;
    const codigoRastreio = String(
      dadosTracking.trackNumber ??
        dadosTracking.trackingNumber ??
        dadosTracking.trackingCode ??
        dados.trackNumber ??
        ""
    ).trim();
    const transportadora = String(
      dadosTracking.trackingProvider ??
        dadosTracking.logisticsName ??
        dadosTracking.carrier ??
        dados.trackingProvider ??
        ""
    ).trim();
    const urlRastreio = String(
      dadosTracking.trackingUrl ??
        dadosTracking.trackUrl ??
        dados.trackingUrl ??
        ""
    ).trim();

    const updatePayload = {
      cj_status: dados.orderStatus ?? null,
      cj_internal_order_id:
        dados.orderId === null || dados.orderId === undefined
          ? null
          : String(dados.orderId),
      cj_order_code: dados.cjOrderCode ?? null,
      cj_tracking_code: dados.trackNumber ?? null,
      cj_tracking_provider: dados.trackingProvider ?? null,
      cj_tracking_url: dados.trackingUrl ?? null,
      cj_status_updated_at: new Date().toISOString(),
      ...(codigoRastreio || transportadora || urlRastreio
        ? {
            cj_tracking_code: codigoRastreio || null,
            cj_tracking_provider: transportadora || null,
            cj_tracking_url: urlRastreio || null,
            codigo_rastreio: codigoRastreio || null,
            transportadora: transportadora || null,
          }
        : {}),
    };

    console.log("[CJ TRACKING] update payload:", updatePayload);

    const resultadoUpdate = await supabase
      .from("pedido")
      .update(updatePayload)
      .eq("id", pedido.id)
      .select()
      .single();

    if (resultadoUpdate.error) {
      await registrarHistoricoCJ({
        pedidoId: pedido.id,
        cjOrderId,
        statusAnterior,
        statusNovo: dados.orderStatus,
        trackingCode: codigoRastreio || null,
        erro: resultadoUpdate.error.message,
      });
      return resultadoUpdate;
    }

    const statusNovo = String(dados.orderStatus ?? "").trim().toUpperCase();
    const trackingDisponivelPelaPrimeiraVez =
      !String(pedido.cj_tracking_code ?? pedido.codigo_rastreio ?? "").trim() &&
      Boolean(codigoRastreio);

    if (trackingDisponivelPelaPrimeiraVez) {
      await registrarNotificacaoCJ(pedido.id, "TRACKING_AVAILABLE");
    }

    if (statusNovo === "DELIVERED" && statusAnterior !== "DELIVERED") {
      await registrarNotificacaoCJ(pedido.id, "ORDER_DELIVERED");
    }

    await registrarHistoricoCJ({
      pedidoId: pedido.id,
      cjOrderId,
      statusAnterior,
      statusNovo: dados.orderStatus,
      trackingCode: codigoRastreio || null,
    });

    return resultadoUpdate;
  } catch (error) {
    await registrarHistoricoCJ({
      pedidoId: pedido.id,
      cjOrderId,
      statusAnterior,
      erro: error instanceof Error ? error.message : "Erro desconhecido.",
    });
    throw error;
  }
}

export async function sincronizarPedidosCJ() {
  const { data: pedidos, error: buscaError } = await supabase
    .from("pedido")
    .select("*")
    .not("cj_order_id", "is", null);

  if (buscaError) {
    return {
      sincronizados: 0,
      erros: [{ id: null, error: buscaError.message }],
    };
  }

  let sincronizados = 0;
  const erros: Array<{ id: number; error: string }> = [];

  for (const pedido of pedidos ?? []) {
    const status = String(pedido.cj_status ?? "").trim().toUpperCase();
    if (status === "DELIVERED" || status === "CANCELLED") continue;

    try {
      const resultado = await sincronizarPedidoCJ(pedido);

      if (resultado.error) {
        erros.push({ id: pedido.id, error: resultado.error.message });
      } else {
        sincronizados += 1;
      }
    } catch (error) {
      erros.push({
        id: pedido.id,
        error: error instanceof Error ? error.message : "Erro desconhecido.",
      });
    }
  }

  return { sincronizados, erros };
}
