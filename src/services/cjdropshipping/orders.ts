import { cjRequest } from "./client";

export async function criarPedido(
  pedido: any
) {
  return cjRequest("/shopping/order/createOrder", {
    method: "POST",
    body: JSON.stringify(pedido),
  });
}