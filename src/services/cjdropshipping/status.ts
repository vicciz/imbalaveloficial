import { cjRequest } from "./client";

export type CjOrderStatusResponse = {
  code?: number | string;
  result?: boolean;
  success?: boolean;
  message?: string;
  data?: unknown;
};

export async function buscarStatusPedido(
  cjOrderId: string
): Promise<CjOrderStatusResponse> {
  const orderId = cjOrderId.trim();

  if (!orderId) {
    throw new Error("cj_order_id é obrigatório.");
  }

  return cjRequest<CjOrderStatusResponse>(
    `/shopping/order/getOrderDetail?orderId=${encodeURIComponent(orderId)}`
  );
}
