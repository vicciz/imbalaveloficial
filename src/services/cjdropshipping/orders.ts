import { cjRequest } from "./client";

export async function criarPedido<TResponse = {
  data?: {
    orderId?: string | number;
    orderNumber?: string;
    shipmentOrderId?: string | number | null;
    orderStatus?: string;
  };
  message?: string;
}>(
  pedido: unknown
) {
  return cjRequest<TResponse>("/shopping/order/createOrder", {
    method: "POST",
    body: JSON.stringify(pedido),
  });
}