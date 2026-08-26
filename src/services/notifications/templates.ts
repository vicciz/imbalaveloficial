import {
  DadosPedidoNotificacao,
  TemplateNotificacao,
  TemplateNotificacaoFn,
  TipoNotificacao,
} from "./types";

function identificarPedido(pedido: DadosPedidoNotificacao) {
  return pedido.numero ?? pedido.id;
}

export const templateTrackingAvailable: TemplateNotificacaoFn = (pedido) => {
  const codigo = pedido.codigo_rastreio?.trim();
  const transportadora = pedido.transportadora?.trim();
  const pedidoIdentificado = identificarPedido(pedido);
  const detalhes = [codigo, transportadora].filter(Boolean).join(" - ");

  return {
    titulo: "Rastreamento disponível",
    mensagem: detalhes
      ? `O rastreamento do pedido #${pedidoIdentificado} está disponível: ${detalhes}.`
      : `O rastreamento do pedido #${pedidoIdentificado} está disponível.`,
    assunto: `Rastreamento disponível para o pedido #${pedidoIdentificado}`,
  };
};

export const templateOrderDelivered: TemplateNotificacaoFn = (pedido) => {
  const pedidoIdentificado = identificarPedido(pedido);

  return {
    titulo: "Pedido entregue",
    mensagem: `O pedido #${pedidoIdentificado} foi entregue.`,
    assunto: `Pedido #${pedidoIdentificado} entregue`,
  };
};

export const templatesNotificacao: Record<
  TipoNotificacao,
  TemplateNotificacaoFn
> = {
  TRACKING_AVAILABLE: templateTrackingAvailable,
  ORDER_DELIVERED: templateOrderDelivered,
};

export function obterTemplateNotificacao(
  tipo: TipoNotificacao,
  pedido: DadosPedidoNotificacao
): TemplateNotificacao {
  return templatesNotificacao[tipo](pedido);
}
