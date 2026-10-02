import { cjRequest } from "./client";
import { buscarStatusPedido, type CjOrderStatusResponse } from "./status";

type CjOrderMutationResponse = {
  code?: number | string;
  result?: boolean;
  success?: boolean;
  message?: string;
  msg?: string;
};

export type CjCancellationResult = {
  status: string;
  action: "DELETE" | "none";
  result: string;
};

function respostaCJValida(resposta: CjOrderMutationResponse) {
  return (
    Number(resposta.code) === 200 &&
    (resposta.result === true || resposta.success === true)
  );
}

export async function cancelarPedidoCJ(
  cjOrderId: string,
  options?: { beforeDelete?: (status: string) => Promise<void> }
): Promise<CjCancellationResult> {
  const orderId = cjOrderId.trim();
  if (!orderId) {
    throw new Error("CJ order ID vazio.");
  }

  let statusResponse: CjOrderStatusResponse;
  try {
    statusResponse = await buscarStatusPedido(orderId);
  } catch (error) {
    console.info("[CJ] Status CJ: falha na consulta");
    console.info("[CJ] Ação: nenhuma");
    console.error("[CJ] Resultado: falha ao consultar status", {
      cjOrderId: orderId,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
  if (
    Number(statusResponse.code) !== 200 ||
    !(statusResponse.result === true || statusResponse.success === true) ||
    !statusResponse.data
  ) {
    const error = new Error(
      `Não foi possível consultar status do pedido CJ ${orderId}: ${
        statusResponse.message ?? "resposta inválida"
      }`
    );
    console.info("[CJ] Status CJ: resposta inválida");
    console.info("[CJ] Ação: nenhuma");
    console.error("[CJ] Resultado: falha ao consultar status", { cjOrderId: orderId });
    throw error;
  }

  const cjOrderIdReal = String(statusResponse.data.orderId ?? orderId).trim();
  console.info("[CJ] CJ order ID:", cjOrderIdReal);

  const orderStatus = String(statusResponse.data.orderStatus ?? "")
    .trim()
    .toUpperCase();
  const subStatus = String(statusResponse.data.subStatus ?? "")
    .trim()
    .toUpperCase();
  const cjStatus = [orderStatus, subStatus].filter(Boolean).join(" / ") || "desconhecido";
  console.info("[CJ] Status CJ:", cjStatus);

  const allowedStates = new Set(["CREATED", "IN_CART"]);
  const states = [orderStatus, subStatus].filter(Boolean);
  if (!states.length || !states.every((state) => allowedStates.has(state))) {
    const result = "não removível pelo endpoint deleteOrder neste estado";
    console.info("[CJ] Ação: nenhuma");
    console.info("[CJ] Resultado:", result);
    return { status: cjStatus, action: "none", result };
  }

  try {
    await options?.beforeDelete?.(cjStatus);
    console.info("[CJ] Ação: DELETE /api2.0/v1/shopping/order/deleteOrder");
    const deleteResponse = await cjRequest<CjOrderMutationResponse>(
      `/shopping/order/deleteOrder?orderId=${encodeURIComponent(cjOrderIdReal)}`,
      { method: "DELETE" }
    );

    if (!respostaCJValida(deleteResponse)) {
      throw new Error(
        deleteResponse.message ?? deleteResponse.msg ?? "Resposta de exclusão inválida da CJ."
      );
    }

    console.info("[CJ] Resultado: sucesso");
    return { status: cjStatus, action: "DELETE", result: "sucesso" };
  } catch (error) {
    console.error("[CJ] Resultado: falha", {
      cjOrderId: orderId,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
}