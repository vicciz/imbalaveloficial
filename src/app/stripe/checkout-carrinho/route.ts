import { NextResponse } from "next/server";
import { criarCheckoutCarrinho } from "@/src/services/pedido/checkout";
import { supabase } from "@/supabaseClient";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!accessToken) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 }
    );
  }

  const { data: authData, error: authError } =
    await supabase.auth.getUser(accessToken);

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: "Sessão inválida." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const enderecoId = body?.enderecoId;
  const selectedItemIds = body?.selectedItemIds;

  if (!Number.isInteger(enderecoId) || enderecoId <= 0) {
    return NextResponse.json(
      { error: "EnderecoId inválido" },
      { status: 400 }
    );
  }

  if (
    !Array.isArray(selectedItemIds) ||
    selectedItemIds.length === 0 ||
    selectedItemIds.some((id) => !Number.isInteger(id) || id <= 0)
  ) {
    return NextResponse.json(
      { error: "Selecione ao menos um item do carrinho" },
      { status: 400 }
    );
  }

  try {
    const session = await criarCheckoutCarrinho(
      authData.user.id,
      enderecoId,
      selectedItemIds
    );

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao iniciar checkout",
      },
      { status: 400 }
    );
  }
}