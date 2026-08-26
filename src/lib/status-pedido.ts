const statusLabels: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  processing: "Em processamento",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  cancelado: "Cancelado",
  created: "Criado",
  error: "Erro",
};

export function traduzirStatusPedido(status: unknown) {
  const valor = String(status ?? "").trim();
  return statusLabels[valor.toLowerCase()] ?? (valor || "Sem status");
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
