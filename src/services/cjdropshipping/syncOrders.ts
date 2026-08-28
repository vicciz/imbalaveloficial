import { supabase } from "@/supabaseClient";
import {
  buscarStatusPedido,
  type CjOrderStatusData,
  type CjOrderStatusResponse,
} from "./status";
import { buscarTrackingPedido } from "./tracking";
import { registrarNotificacaoCJ } from "./notifications";

function respostaCJValida(resposta: CjOrderStatusResponse) {
  return (
    Number(resposta?.code) === 200 &&
    (resposta?.result === true || resposta?.success === true) &&
    !!resposta?.data &&
    typeof resposta.data === "object"
  );
}

function normalizarStatusCJ(orderStatus: unknown, subStatus: unknown) {
  const principal = String(orderStatus ?? "").trim().toUpperCase();
  const sub = String(subStatus ?? "").trim().toUpperCase();

  if (!principal) return "";

  // IMPORTANTE: o status principal retornado pela CJ deve ser preservado.
  // Em especial, UNPAID nunca pode ser convertido para IN_CART.
  // A CJ usa UNSHIPPED como status pai e, quando aplicável, PENDING/PROCESSING
  // como substatus operacional. Nesses dois casos mantemos o substatus;
  // nos demais, gravamos exatamente o status principal normalizado.
  if (
    principal === "UNSHIPPED" &&
    (sub === "PENDING" || sub === "PROCESSING")
  ) {
    return sub;
  }

  return principal;
}

async function consultarDetalhesCJ(pedido: {
  cj_order_id?: string | null;
  cj_internal_order_id?: string | number | null;
  cj_order_code?: string | null;
}) {
  // Prioriza o código SD... do pedido da CJ, depois o ID interno e,
  // por último, o orderNumber personalizado da Imbalável.
  const candidatos = [
    pedido.cj_order_code,
    pedido.cj_internal_order_id,
    pedido.cj_order_id,
  ]
    .map((valor) => String(valor ?? "").trim())
    .filter(Boolean);

  let ultimaResposta: CjOrderStatusResponse | null = null;

  for (const candidato of [...new Set(candidatos)]) {
    const resposta = await buscarStatusPedido(candidato);
    ultimaResposta = resposta;

    if (respostaCJValida(resposta)) {
      return { resposta, consultaPor: candidato };
    }
  }

  throw new Error(
    `A CJ não retornou os detalhes do pedido. Código ${
      ultimaResposta?.code ?? "desconhecido"
    }: ${ultimaResposta?.message ?? "Resposta inválida da CJ."}`
  );
}

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
    // O histórico não pode invalidar uma sincronização válida.
    console.warn("[CJ SYNC] Histórico não registrado:", {
      pedidoId: dados.pedidoId,
      error: error.message,
    });
  }
}

export async function sincronizarPedidoCJ(pedido: {
  id: number;
  cj_order_id?: string | null;
  cj_internal_order_id?: string | number | null;
  cj_order_code?: string | null;
  cj_status?: string | null;
  cj_tracking_code?: string | null;
  codigo_rastreio?: string | null;
}) {
  const statusAtual = String(pedido.cj_status ?? "").trim().toUpperCase();

  if (statusAtual === "DELIVERED" || statusAtual === "CANCELLED") {
    return { data: pedido, error: null };
  }

  const statusAnterior = pedido.cj_status ?? null;
  const identificadorHistorico = String(
    pedido.cj_order_code ??
      pedido.cj_internal_order_id ??
      pedido.cj_order_id ??
      ""
  ).trim();

  if (!identificadorHistorico) {
    throw new Error("O pedido não possui identificador da CJ.");
  }

  try {
    const { resposta, consultaPor } = await consultarDetalhesCJ(pedido);
    const dados = resposta.data as CjOrderStatusData;

    const statusNovo = normalizarStatusCJ(
      dados.orderStatus,
      dados.subStatus
    );

    if (!statusNovo) {
      throw new Error(
        `A CJ respondeu com sucesso, mas não informou orderStatus. Consulta: ${consultaPor}.`
      );
    }

    let codigoRastreio = String(
      dados.trackNumber ??
        pedido.cj_tracking_code ??
        pedido.codigo_rastreio ??
        ""
    ).trim();

    let transportadora = String(dados.trackingProvider ?? "").trim();
    let urlRastreio = String(dados.trackingUrl ?? "").trim();

    // Não chama tracking enquanto não existir número de rastreio.
    // Isso evita o erro 1600101 que aparecia no seu teste.
    if (codigoRastreio) {
      try {
        const respostaTracking = await buscarTrackingPedido(codigoRastreio);
        console.log("[CJ TRACKING] resposta CJ:", respostaTracking);

        if (respostaCJValida(respostaTracking as CjOrderStatusResponse)) {
          const lista = Array.isArray((respostaTracking as any).data)
            ? (respostaTracking as any).data
            : [];
          const primeiro = lista[0] ?? {};

          codigoRastreio = String(
            primeiro.trackingNumber ?? codigoRastreio
          ).trim();
          transportadora = String(
            primeiro.logisticName ?? transportadora
          ).trim();
        }
      } catch (trackingError) {
        // O status do pedido continua válido mesmo se a consulta de tracking falhar.
        console.warn("[CJ TRACKING] Falha ao consultar rastreio:", {
          pedidoId: pedido.id,
          error:
            trackingError instanceof Error
              ? trackingError.message
              : "Erro desconhecido.",
        });
      }
    }

    const updatePayload: Record<string, unknown> = {
      cj_status: statusNovo,
      cj_status_updated_at: new Date().toISOString(),
    };

    // A CJ retorna dois identificadores diferentes:
    // - orderId: identificador interno da CJ (numérico)
    // - cjOrderId: identificador público da ordem (CJ...)
    // Ambos precisam ser persistidos para que as próximas sincronizações
    // consigam localizar o pedido mesmo que um dos identificadores mude.
    if (dados.orderId !== null && dados.orderId !== undefined) {
      updatePayload.cj_internal_order_id = String(dados.orderId);
    }

    if (dados.cjOrderId) {
      updatePayload.cj_order_id = String(dados.cjOrderId);
    }

    if (dados.cjOrderCode) {
      updatePayload.cj_order_code = String(dados.cjOrderCode);
    }

    if (codigoRastreio) {
      updatePayload.cj_tracking_code = codigoRastreio;
      updatePayload.codigo_rastreio = codigoRastreio;
    }

    if (transportadora) {
      updatePayload.cj_tracking_provider = transportadora;
      updatePayload.transportadora = transportadora;
    }

    if (urlRastreio) {
      updatePayload.cj_tracking_url = urlRastreio;
    }

    console.log("[CJ SYNC] consulta válida:", {
      pedidoId: pedido.id,
      consultaPor,
      orderStatus: dados.orderStatus ?? null,
      subStatus: dados.subStatus ?? null,
      statusEfetivo: statusNovo,
      cjOrderCode: dados.cjOrderCode ?? null,
    });
    console.log("[CJ SYNC] update payload:", updatePayload);

    const resultadoUpdate = await supabase
      .from("pedido")
      .update(updatePayload)
      .eq("id", pedido.id)
      .select()
      .single();

    if (resultadoUpdate.error) {
      await registrarHistoricoCJ({
        pedidoId: pedido.id,
        cjOrderId: identificadorHistorico,
        statusAnterior,
        statusNovo,
        trackingCode: codigoRastreio || null,
        erro: resultadoUpdate.error.message,
      });
      return resultadoUpdate;
    }

    const trackingDisponivelPelaPrimeiraVez =
      !String(
        pedido.cj_tracking_code ?? pedido.codigo_rastreio ?? ""
      ).trim() && Boolean(codigoRastreio);

    if (trackingDisponivelPelaPrimeiraVez) {
      await registrarNotificacaoCJ(pedido.id, "TRACKING_AVAILABLE");
    }

    if (statusNovo === "DELIVERED" && statusAnterior !== "DELIVERED") {
      await registrarNotificacaoCJ(pedido.id, "ORDER_DELIVERED");
    }

    await registrarHistoricoCJ({
      pedidoId: pedido.id,
      cjOrderId: identificadorHistorico,
      statusAnterior,
      statusNovo,
      trackingCode: codigoRastreio || null,
    });

    return resultadoUpdate;
  } catch (error) {
    // Falha na CJ NÃO sobrescreve o status que já estava salvo.
    await registrarHistoricoCJ({
      pedidoId: pedido.id,
      cjOrderId: identificadorHistorico,
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
    .or("cj_order_id.not.is.null,cj_order_code.not.is.null,cj_internal_order_id.not.is.null");

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
        error:
          error instanceof Error ? error.message : "Erro desconhecido.",
      });
    }
  }

  return { sincronizados, erros };
}
