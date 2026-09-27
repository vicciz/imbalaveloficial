import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminClient } from "@/src/services/products/repository/adminSupabase";
import { supabaseErrorMessage } from "@/src/services/products/repository/supabaseError";

function createAuthenticatedSupabaseClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Configuração do Supabase ausente.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export async function PATCH(
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

  try {
    const authenticatedSupabase = createAuthenticatedSupabaseClient(accessToken);
    const { data: authData, error: authError } =
      await authenticatedSupabase.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }

    const { data: usuario, error: usuarioError } = await authenticatedSupabase
      .from("usuario")
      .select("role")
      .eq("user_id", authData.user.id)
      .single();

    if (usuarioError || usuario?.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { id } = await context.params;
    const itemId = Number(id);
    if (!Number.isInteger(itemId) || itemId <= 0) {
      return NextResponse.json({ error: "Item de variação inválido." }, { status: 400 });
    }

    const body: unknown = await request.json().catch(() => null);
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Dados da variação inválidos." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const price = input.preco;
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Preço de venda inválido." }, { status: 400 });
    }

    if ("aplicar_em_todas" in input && typeof input.aplicar_em_todas !== "boolean") {
      return NextResponse.json({ error: "Opção de aplicação inválida." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    if (input.aplicar_em_todas === true) {
      const productId = input.produto_id;
      if (typeof productId !== "number" || !Number.isInteger(productId) || productId <= 0) {
        return NextResponse.json({ error: "Produto inválido para aplicação em lote." }, { status: 400 });
      }

      const { data: variations, error: variationsError } = await supabaseAdmin
        .from("produto_variacao")
        .select("id")
        .eq("id_produto", productId);

      if (variationsError) {
        return NextResponse.json(
          { error: supabaseErrorMessage(variationsError, "Falha ao buscar variações do produto") },
          { status: 500 }
        );
      }

      const variationIds = (variations ?? []).map((variation) => variation.id as number);
      if (variationIds.length === 0) {
        return NextResponse.json({ error: "O produto não possui variações." }, { status: 404 });
      }

      const { data, error } = await supabaseAdmin
        .from("produto_variacao_item")
        .update({ preco: price })
        .in("id_variacao", variationIds)
        .select("id,preco");

      if (error) {
        return NextResponse.json(
          { error: supabaseErrorMessage(error, "Falha ao aplicar preço às variações") },
          { status: 500 }
        );
      }

      if (!data?.length) {
        return NextResponse.json({ error: "Nenhum item de variação foi atualizado." }, { status: 404 });
      }

      return NextResponse.json({ data, updatedCount: data.length });
    }

    const update: Record<string, string | number | boolean | null> = {
      preco: price,
    };

    if ("custo_fornecedor" in input) {
      const supplierCost = input.custo_fornecedor;
      if (
        supplierCost !== null &&
        (typeof supplierCost !== "number" || !Number.isFinite(supplierCost) || supplierCost < 0)
      ) {
        return NextResponse.json({ error: "Custo do fornecedor inválido." }, { status: 400 });
      }
      update.custo_fornecedor = supplierCost as number | null;
    }

    if ("estoque" in input) {
      const stock = input.estoque;
      if (typeof stock !== "number" || !Number.isFinite(stock)) {
        return NextResponse.json({ error: "Estoque inválido." }, { status: 400 });
      }
      update.estoque = stock;
    }

    if ("sku" in input) {
      if (typeof input.sku !== "string") {
        return NextResponse.json({ error: "SKU inválido." }, { status: 400 });
      }
      update.sku = input.sku;
    }

    if ("ativo" in input) {
      if (typeof input.ativo !== "boolean") {
        return NextResponse.json({ error: "Status da variação inválido." }, { status: 400 });
      }
      update.ativo = input.ativo;
    }

    if ("imagem_principal" in input) {
      const image = input.imagem_principal;
      if (image !== null && typeof image !== "string") {
        return NextResponse.json({ error: "Imagem da variação inválida." }, { status: 400 });
      }
      update.imagem_principal = image as string | null;
    }

    const { data, error } = await supabaseAdmin
      .from("produto_variacao_item")
      .update(update)
      .eq("id", itemId)
      .select("id,preco,custo_fornecedor,estoque,sku,ativo,imagem_principal")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: supabaseErrorMessage(error, "Falha ao salvar variação") },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Item de variação não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Falha ao salvar variação.",
      },
      { status: 500 }
    );
  }
}