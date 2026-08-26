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
    status: resultado.data.status,
    cancelado_em: resultado.data.cancelado_em,
    motivo_cancelamento: resultado.data.motivo_cancelamento,
  });
}
