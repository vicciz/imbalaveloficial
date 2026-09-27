const statusLabels: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  processing: "Em processamento",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  canceled: "Cancelado",
  cancelado: "Cancelado",
  created: "Criado",
  error: "Erro",
  in_cart: "No carrinho da CJ",
  unpaid: "Aguardando pagamento na CJ",
  unshipped: "Aguardando envio",
};

const statusCJLabels: Record<string, string> = {
  created: "Pedido recebido",
  sent: "Pedido recebido",
  in_cart: "Em preparação",
  unpaid: "Em processamento",
  pending: "Aguardando processamento",
  processing: "Em preparação",
  unshipped: "Aguardando envio",
  awaiting_shipment: "Aguardando envio",
  waiting_for_shipment: "Aguardando envio",
  shipped: "Enviado",
  partially_shipped: "Parcialmente enviado",
  delivered: "Entregue",
  completed: "Concluído",
  cancelled: "Cancelado",
  canceled: "Cancelado",
  closed: "Encerrado",
  refunded: "Reembolsado",
  error: "Pedido em análise",
};

export function traduzirStatusPedido(status: unknown) {
  const valor = String(status ?? "").trim();
  return statusLabels[valor.toLowerCase()] ?? (valor || "Sem status");
}

export function traduzirStatusCJ(status: unknown) {
  const valor = String(status ?? "").trim();
  return statusCJLabels[valor.toLowerCase()] ?? (valor || "Sem status da CJ");
}

export function podeCancelarPedido(statusPedido: unknown, statusCJ?: unknown) {
  const statusNormalizado = String(statusPedido ?? "").trim().toLowerCase();
  const statusCJNormalizado = String(statusCJ ?? "").trim().toLowerCase();
  const statusCJBloqueado = [
    "shipped",
    "delivered",
    "cancelled",
    "canceled",
  ].some((status) => statusCJNormalizado.includes(status));
  const transporteIniciado = ["transit", "dispatch", "shipping", "delivery"].some(
    (status) => statusCJNormalizado.includes(status)
  );

  return (
    ["paid", "created", "processing"].includes(statusNormalizado) &&
    !statusCJBloqueado &&
    !transporteIniciado
  );
}
