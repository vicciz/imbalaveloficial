import { NextRequest, NextResponse } from "next/server";
import { buscarStatusPedido } from "@/src/services/cjdropshipping/status";
import { supabase } from "@/supabaseClient";

export async function GET(request: NextRequest) {
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

  const orderId = request.nextUrl.searchParams.get("orderId")?.trim();

  if (!orderId) {
    return NextResponse.json(
      {
        error:
          "Informe orderId. Use o código do pedido Imbalável (ex.: IMB-13-1) ou o identificador aceito pela CJ.",
      },
      { status: 400 }
    );
  }

  try {
    const response = await buscarStatusPedido(orderId);

    return NextResponse.json({
      cjOrderId: orderId,
      response,
    });
  } catch (error) {
    console.error("[CJ STATUS TEST] erro:", error);
    return NextResponse.json(
      {
        cjOrderId: orderId,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível consultar a CJ.",
      },
      { status: 502 }
    );
  }
}
