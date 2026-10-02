import { enviarEmail } from "./resend";

type PedidoEmailItem = {
  id_produto?: number | string | null;
  nome_produto?: string | null;
  nome?: string | null;
  produto?: { nome?: string | null } | { nome?: string | null }[] | null;
  quantidade?: number | string | null;
  preco_unitario?: number | string | null;
  subtotal?: number | string | null;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export async function enviarEmailCancelamentoPedido(params: {
  to: string;
  pedidoId: number;
  motivo: string | null;
  valorTotal: number;
  itens: PedidoEmailItem[];
  refundId: string | null;
  refundStatus: string | null;
  canceladoEm: string;
}) {
  const dataCancelamento = new Date(params.canceladoEm).toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
  const refundStatus = params.refundStatus?.trim() || "solicitado";
  const refundMessage = params.refundId
    ? `Estorno ${escapeHtml(refundStatus)}. Referência: ${escapeHtml(params.refundId)}. O prazo para o valor aparecer depende da instituição financeira.`
    : "Não houve cobrança concluída que exigisse estorno.";
  const motivo = params.motivo?.trim() || "Não informado";
  const produtosHtml = params.itens.length
    ? params.itens.map((item) => {
        const produto = Array.isArray(item.produto) ? item.produto[0] : item.produto;
        const nome = produto?.nome ?? item.nome_produto ?? item.nome ?? `Produto ${item.id_produto ?? ""}`;
        const quantidade = Math.max(1, Number(item.quantidade) || 1);
        const subtotal = Number(item.subtotal ?? Number(item.preco_unitario ?? 0) * quantidade);

        return `<li style="margin:0 0 8px;">${escapeHtml(nome)} — ${quantidade}x — ${formatMoney(subtotal)}</li>`;
      }).join("")
    : "<li>Detalhes dos produtos indisponíveis.</li>";
  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
        <div style="font-size:22px;font-weight:700;">Imbalavel</div>
        <h1 style="margin:24px 0 8px;font-size:24px;">Pedido #${params.pedidoId} cancelado</h1>
        <p style="color:#475569;line-height:1.6;">Sua compra foi cancelada conforme solicitado.</p>
        <dl style="line-height:1.8;">
          <dt style="font-weight:700;">Produtos</dt>
          <dd style="margin:0 0 12px;"><ul style="padding-left:20px;">${produtosHtml}</ul></dd>
          <dt style="font-weight:700;">Motivo</dt>
          <dd style="margin:0 0 12px;">${escapeHtml(motivo)}</dd>
          <dt style="font-weight:700;">Valor do pedido</dt>
          <dd style="margin:0 0 12px;">${formatMoney(params.valorTotal)}</dd>
          <dt style="font-weight:700;">Estorno Stripe</dt>
          <dd style="margin:0 0 12px;">${refundMessage}</dd>
          <dt style="font-weight:700;">Data do cancelamento</dt>
          <dd style="margin:0;">${escapeHtml(dataCancelamento)}</dd>
        </dl>
      </div>
      <p style="margin:18px 0;text-align:center;color:#94a3b8;font-size:12px;">Este é um e-mail automático da Imbalavel.</p>
    </div>
  </body>
</html>`;

  await enviarEmail({
    to: params.to,
    subject: `Cancelamento do pedido #${params.pedidoId} — Imbalavel`,
    html,
    idempotencyKey: `pedido-cancelamento-${params.pedidoId}`,
  });
}