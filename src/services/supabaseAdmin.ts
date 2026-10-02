import "server-only";

import { createClient } from "@supabase/supabase-js";

type PedidoRow = {
  id: number;
  id_usuario: string;
  created_at: string;
  status: string | null;
  cj_status: string | null;
  stripe_session_id: string | null;
  stripe_refund_id: string | null;
  stripe_refund_status: string | null;
  stripe_refunded_at: string | null;
  stripe_refund_error: string | null;
  valorTotal: number | string | null;
  cj_order_id: string | null;
  cj_order_ids: unknown[] | null;
  cancelado_em: string | null;
  motivo_cancelamento: string | null;
  cancelado_por: string | null;
  cancelamento_em_andamento: boolean;
  cancelamento_inicio_em: string | null;
  cj_cancelamento_resultados: Record<string, unknown>;
  cancelamento_email_tentado_em: string | null;
  cancelamento_email_enviado_em: string | null;
} & Record<string, unknown>;

type UsuarioRow = {
  id: number;
  user_id: string;
  nome: string;
  email: string | null;
  role: string;
} & Record<string, unknown>;

type PedidoEventoRow = {
  id: number;
  pedido_id: number;
  tipo: string;
  status_anterior: string | null;
  status_novo: string | null;
  motivo: string | null;
  dados: Record<string, unknown> | null;
  created_at: string;
} & Record<string, unknown>;

type Database = {
  public: {
    Tables: {
      pedido: {
        Row: PedidoRow;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      pedido_evento: {
        Row: PedidoEventoRow;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      usuario: {
        Row: UsuarioRow;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdminClient() {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey?.trim()) {
    throw new Error("Configuração server-side do Supabase ausente.");
  }

  supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}