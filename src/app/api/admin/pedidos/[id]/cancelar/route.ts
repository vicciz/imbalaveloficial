import { NextRequest, NextResponse } from "next/server";
import { cancelarPedido } from "@/src/services/pedido/cancellationService";
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
  const body = await request.json().catch(() => ({}));

  if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const resultado = await cancelarPedido(pedidoId, {
    motivo: typeof body.motivo === "string" ? body.motivo : null,
    canceladoPor: authData.user.id,
  });

  if (resultado.error || !resultado.data) {
    return NextResponse.json(
      { error: resultado.error?.message ?? "Não foi possível cancelar o pedido." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    id: resultado.data.id,
    id_usuario: resultado.data.id_usuario,
    status: resultado.data.status,
    created_at: resultado.data.created_at,
    cancelado_em: resultado.data.cancelado_em,
    motivo_cancelamento: resultado.data.motivo_cancelamento,
    cancelado_por: resultado.data.cancelado_por,
    stripe_refund_id: resultado.data.stripe_refund_id,
    stripe_refund_status: resultado.data.stripe_refund_status,
    cj_status: resultado.data.cj_status,
    cj_order_id: resultado.data.cj_order_id,
    cj_order_ids: resultado.data.cj_order_ids,
    cj_cancelamento_resultados: resultado.data.cj_cancelamento_resultados,
  });
}
