import { supabase } from "@/supabaseClient";

type PedidoNotificacao = {
  id: number;
  pedido_id: number;
  tipo: "TRACKING_AVAILABLE" | "ORDER_DELIVERED" | string;
  created_at: string;
};

export type NotificationMessagePayload = {
  notificationId: number;
  pedidoId: number;
  tipo: string;
  createdAt: string;
};

export async function processarNotificacoes() {
  const { data: notificacoes, error: buscaError } = await supabase
    .from("pedido_notificacao")
    .select("id, pedido_id, tipo, created_at")
    .is("processed_at", null)
    .order("created_at", { ascending: true });

  if (buscaError) {
    return {
      processadas: 0,
      payloads: [] as NotificationMessagePayload[],
      erros: [{ id: null, error: buscaError.message }],
    };
  }

  const payloads: NotificationMessagePayload[] = [];
  const erros: Array<{ id: number; error: string }> = [];

  for (const notificacao of (notificacoes ?? []) as PedidoNotificacao[]) {
    const payload: NotificationMessagePayload = {
      notificationId: notificacao.id,
      pedidoId: notificacao.pedido_id,
      tipo: notificacao.tipo,
      createdAt: notificacao.created_at,
    };

    const { error: updateError } = await supabase
      .from("pedido_notificacao")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", notificacao.id)
      .is("processed_at", null);

    if (updateError) {
      erros.push({ id: notificacao.id, error: updateError.message });
      continue;
    }

    payloads.push(payload);
  }

  return {
    processadas: payloads.length,
    payloads,
    erros,
  };
}
