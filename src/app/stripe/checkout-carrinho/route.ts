import { NextResponse } from "next/server";
import { criarCheckoutCarrinho } from "@/src/services/pedido/checkout";
import { supabase } from "@/supabaseClient";

export async function POST(request: Request) {
  const { userId, enderecoId, selectedItemIds } = await request.json();

  if (!userId) {
    return NextResponse.json(
      { error: "UserId não enviado" },
      { status: 400 }
    );
  }

  if (!enderecoId) {
    return NextResponse.json(
      { error: "EnderecoId não enviado" },
      { status: 400 }
    );
  }

  if (!Array.isArray(selectedItemIds) || !selectedItemIds.length) {
    return NextResponse.json(
      { error: "Selecione ao menos um item do carrinho" },
      { status: 400 }
    );
  }

  const session = await criarCheckoutCarrinho(
    userId,
    enderecoId,
    selectedItemIds
  );

  return NextResponse.json({
    url: session.url,
  });
}