import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabaseClient";
import { getSupabaseAdminClient } from "@/src/services/supabaseAdmin";

const MAX_IDS_PER_REQUEST = 500;

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!accessToken) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { data: adminUser, error: adminError } = await supabaseAdmin
    .from("usuario")
    .select("role")
    .eq("user_id", authData.user.id)
    .single();

  if (adminError || adminUser?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const pedidoIdsRecebidos: number[] = Array.isArray(body.pedidoIds)
    ? body.pedidoIds.filter((id: unknown): id is number => Number.isInteger(id) && Number(id) > 0)
    : [];
  const userIdsRecebidos: string[] = Array.isArray(body.userIds)
    ? body.userIds.filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
    : [];
  const pedidoIds = [...new Set<number>(pedidoIdsRecebidos)];
  const userIds = [...new Set<string>(userIdsRecebidos)];

  if (pedidoIds.length > MAX_IDS_PER_REQUEST || userIds.length > MAX_IDS_PER_REQUEST) {
    return NextResponse.json({ error: "Consulta excede o limite de registros." }, { status: 400 });
  }

  const [usersResult, eventsResult] = await Promise.all([
    userIds.length
      ? supabaseAdmin.from("usuario").select("user_id, nome, email").in("user_id", userIds)
      : Promise.resolve({ data: [], error: null }),
    pedidoIds.length
      ? supabaseAdmin
          .from("pedido_evento")
          .select("id, pedido_id, tipo, status_anterior, status_novo, motivo, dados, created_at")
          .in("pedido_id", pedidoIds)
          .eq("tipo", "ORDER_CANCELLED")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (usersResult.error) {
    return NextResponse.json(
      { error: `Falha ao buscar usuários dos pedidos: ${usersResult.error.message}` },
      { status: 500 }
    );
  }

  if (eventsResult.error) {
    console.warn("[ADMIN PEDIDOS] Histórico de cancelamento indisponível:", eventsResult.error.message);
  }

  return NextResponse.json({
    users: usersResult.data ?? [],
    events: eventsResult.error ? [] : eventsResult.data ?? [],
    eventsAvailable: !eventsResult.error,
  });
}