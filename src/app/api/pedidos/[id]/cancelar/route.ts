import { NextRequest, NextResponse } from "next/server";
import { cancelarPedidoCliente } from "@/src/services/pedido/cancellationService";
import { supabase } from "@/supabaseClient";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? ""
  );

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const pedidoId = Number(id);
  if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const motivo = typeof body.motivo === "string" ? body.motivo : "";
  const resultado = await cancelarPedidoCliente(pedidoId, user.id, motivo);

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
