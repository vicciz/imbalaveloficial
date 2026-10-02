import { enviarEmail } from "./resend";

type PedidoEmailItem = Record<string, any>;

type PedidoEmailParams = {
  to: string;
  pedidoId: number | string;
  total: number;
  frete?: number;
  itens: PedidoEmailItem[];
  endereco?: Record<string, any> | null;
};

function money(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number)
    ? number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "R$ 0,00";
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getItemName(item: PedidoEmailItem) {
  return (
    item.produto?.nome ??
    item.nome_produto ??
    item.nome ??
    `Produto ${item.id_produto ?? ""}`
  );
}

function getItemPrice(item: PedidoEmailItem) {
  return Number(
    item.preco_unitario ??
      item.preco ??
      item.variacao?.produto_variacao_item?.[0]?.preco ??
      0
  );
}

function getItemVariation(item: PedidoEmailItem) {
  const variationItems = item.variacao?.produto_variacao_item ?? [];

  const values = variationItems
    .map((variationItem: any) => {
      const type = variationItem.variacao_valor?.variacao_tipo?.nome;
      const value = variationItem.variacao_valor?.valor;
      return type && value ? `${type}: ${value}` : value || null;
    })
    .filter(Boolean);

  return values.join(" • ");
}

function renderAddress(address?: Record<string, any> | null) {
  if (!address) return "";

  const line1 = [address.logradouro, address.numero]
    .filter(Boolean)
    .join(", ");
  const line2 = [address.complemento, address.bairro]
    .filter(Boolean)
    .join(" • ");
  const line3 = [address.cidade, address.estado ?? address.uf]
    .filter(Boolean)
    .join(" - ");

  return [line1, line2, line3, address.cep]
    .filter(Boolean)
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join("");
}

export async function enviarResumoPedidoPorEmail(params: PedidoEmailParams) {
  const rows = params.itens
    .map((item) => {
      const quantity = Math.max(1, Number(item.quantidade) || 1);
      const unitPrice = getItemPrice(item);
      const variation = getItemVariation(item);

      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e5e7eb;">
            <div style="font-weight:700;color:#111827;">${escapeHtml(getItemName(item))}</div>
            ${variation ? `<div style="margin-top:4px;color:#64748b;font-size:13px;">${escapeHtml(variation)}</div>` : ""}
          </td>
          <td style="padding:14px 8px;border-bottom:1px solid #e5e7eb;text-align:center;color:#475569;">${quantity}x</td>
          <td style="padding:14px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827;">${money(unitPrice * quantity)}</td>
        </tr>`;
    })
    .join("");

  const addressHtml = renderAddress(params.endereco);
  const frete = Number(params.frete ?? 0);

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:28px;">
        <div style="font-size:24px;font-weight:800;letter-spacing:-0.02em;">Imbalavel</div>

        <div style="margin-top:28px;">
          <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:#dcfce7;color:#166534;font-size:12px;font-weight:700;">
            PAGAMENTO CONFIRMADO
          </div>
          <h1 style="margin:14px 0 8px;font-size:26px;line-height:1.2;">Compra confirmada!</h1>
          <p style="margin:0;color:#64748b;line-height:1.6;">
            Seu pedido <strong style="color:#0f172a;">#${escapeHtml(params.pedidoId)}</strong> foi confirmado com sucesso.
          </p>
        </div>

        <div style="margin-top:28px;">
          <h2 style="font-size:17px;margin:0 0 10px;">Resumo do pedido</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div style="margin-top:18px;padding-top:16px;border-top:1px solid #e2e8f0;">
          <div style="display:flex;justify-content:space-between;padding:5px 0;color:#64748b;">
            <span>Frete</span><span>${money(frete)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0 0;font-size:19px;font-weight:800;">
            <span>Total</span><span>${money(params.total)}</span>
          </div>
        </div>

        ${addressHtml ? `
        <div style="margin-top:28px;padding:18px;border-radius:12px;background:#f8fafc;">
          <h2 style="font-size:16px;margin:0 0 8px;">Endereço de entrega</h2>
          <div style="color:#475569;font-size:14px;line-height:1.7;">${addressHtml}</div>
        </div>` : ""}

        <div style="margin-top:24px;padding:16px;border-radius:12px;background:#f8fafc;color:#475569;font-size:14px;line-height:1.6;">
          Seu pedido foi registrado e será encaminhado para processamento. Você receberá novas atualizações conforme o pedido avançar.
        </div>
      </div>

      <p style="margin:18px 0;text-align:center;color:#94a3b8;font-size:12px;">
        Este é um e-mail automático da Imbalavel.
      </p>
    </div>
  </body>
</html>`;

  await enviarEmail({
    to: params.to,
    subject: `Pedido #${params.pedidoId} confirmado — Imbalavel`,
    html,
  });
}
