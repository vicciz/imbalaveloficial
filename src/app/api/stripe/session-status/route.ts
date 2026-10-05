import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdminClient } from "@/src/services/products/repository/adminSupabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim();

  if (!sessionId || !/^cs_(test|live)_[-A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.json(
      { error: "Sessão de checkout inválida." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeSecretKey) {
    console.error("[checkout] STRIPE_SECRET_KEY não configurada.");
    return NextResponse.json(
      { error: "Não foi possível verificar o pagamento." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2026-04-22.dahlia",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { status: "not_paid" },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const { data: pedido, error } = await getSupabaseAdminClient()
      .from("pedido")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (error) {
      throw new Error(`Falha ao consultar o pedido: ${error.message}`);
    }

    return NextResponse.json(
      pedido
        ? { status: "created", orderId: pedido.id }
        : { status: "processing" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[checkout] Falha ao verificar o status do pedido.", {
      sessionId,
      error: error instanceof Error ? error.message : "Erro desconhecido.",
    });
    return NextResponse.json(
      { error: "Não foi possível verificar o pedido." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
