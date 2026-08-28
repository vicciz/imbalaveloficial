import { cjRequest } from "./client";

export type CjOrderStatusData = {
  orderId?: string | number | null;
  orderNum?: string | null;
  cjOrderId?: string | null;
  cjOrderCode?: string | null;
  platformOrderId?: string | null;
  orderStatus?: string | null;
  subStatus?: string | null;
  trackNumber?: string | null;
  trackingProvider?: string | null;
  trackingUrl?: string | null;
  [key: string]: unknown;
};

export type CjOrderStatusResponse = {
  code?: number | string;
  result?: boolean;
  success?: boolean;
  message?: string;
  data?: CjOrderStatusData | null;
  requestId?: string;
};

export async function buscarStatusPedido(cjOrderId: string): Promise<CjOrderStatusResponse> {
  const orderId = cjOrderId.trim();

  if (!orderId) {
    throw new Error("cj_order_id é obrigatório.");
  }

  return cjRequest<CjOrderStatusResponse>(
    `/shopping/order/getOrderDetail?orderId=${encodeURIComponent(orderId)}`
  );
}
