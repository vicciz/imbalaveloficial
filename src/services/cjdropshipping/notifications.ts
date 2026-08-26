import { supabase } from "@/supabaseClient";

export type TipoNotificacaoCJ =
  | "TRACKING_AVAILABLE"
  | "ORDER_DELIVERED";

export async function registrarNotificacaoCJ(
  pedidoId: number,
  tipo: TipoNotificacaoCJ
) {
  return supabase.from("pedido_notificacao").upsert(
    {
      pedido_id: pedidoId,
      tipo,
    },
    {
      onConflict: "pedido_id,tipo",
      ignoreDuplicates: true,
    }
  );
}
