import { NextRequest, NextResponse } from "next/server";
import { sincronizarPedidoCJ } from "@/src/services/cjdropshipping/syncOrders";
import { supabase } from "@/supabaseClient";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!accessToken) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: authData, error: authError } =
    await supabase.auth.getUser(accessToken);

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuario")
    .select("role")
    .eq("user_id", authData.user.id)
    .single();

  if (usuarioError || usuario?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await context.params;
  const pedidoId = Number(id);

  if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedido")
    .select("*")
    .eq("id", pedidoId)
    .single();

  if (pedidoError || !pedido) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  try {
    const { data: pedidoAtualizado, error: sincronizacaoError } =
      await sincronizarPedidoCJ(pedido);

    if (sincronizacaoError || !pedidoAtualizado) {
      return NextResponse.json(
        {
          error:
            sincronizacaoError?.message ??
            "Não foi possível sincronizar o pedido CJ.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      id: pedidoAtualizado.id,
      cj_status: pedidoAtualizado.cj_status,
      cj_order_id: pedidoAtualizado.cj_order_id,
      cj_internal_order_id: pedidoAtualizado.cj_internal_order_id,
      cj_order_code: pedidoAtualizado.cj_order_code,
      cj_tracking_code: pedidoAtualizado.cj_tracking_code,
      cj_tracking_provider: pedidoAtualizado.cj_tracking_provider,
      cj_tracking_url: pedidoAtualizado.cj_tracking_url,
      cj_status_updated_at: pedidoAtualizado.cj_status_updated_at,
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Não foi possível sincronizar o pedido CJ.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
