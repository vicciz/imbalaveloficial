import { NextResponse } from "next/server";
import { criarCheckoutCarrinho } from "@/src/services/checkout";
import { supabase } from "@/supabaseClient";
export async function POST(request: Request) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json(
      { error: "UserId não enviado" },
      { status: 400 }
    );
  }

  const session = await criarCheckoutCarrinho(
    userId
  );

  return NextResponse.json({
    url: session.url,
  });
}