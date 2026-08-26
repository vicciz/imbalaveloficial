export type TipoNotificacao =
  | "TRACKING_AVAILABLE"
  | "ORDER_DELIVERED";

export type DadosPedidoNotificacao = {
  id: number;
  numero?: string | number | null;
  codigo_rastreio?: string | null;
  transportadora?: string | null;
  cj_tracking_url?: string | null;
};

export type TemplateNotificacao = {
  titulo: string;
  mensagem: string;
  assunto: string;
};

export type TemplateNotificacaoFn = (
  pedido: DadosPedidoNotificacao
) => TemplateNotificacao;
