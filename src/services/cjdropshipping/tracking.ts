import { cjRequest } from "./client";

export async function buscarTracking(
  orderId: string
) {
  return cjRequest(
    `/shopping/order/getTrackInfo?orderId=${orderId}`
  );
}

export async function buscarTrackingPedido(cjOrderId: string) {
  const orderId = cjOrderId.trim();

  if (!orderId) {
    throw new Error("cj_order_id é obrigatório.");
  }

  return cjRequest(
    `/shopping/order/getTrackInfo?orderId=${encodeURIComponent(orderId)}`
  );
}