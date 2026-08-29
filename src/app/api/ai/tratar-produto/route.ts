import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/supabaseClient";
import { createAIProvider } from "@/src/services/products/enhancer/ai";
import { cleanHtml } from "@/src/services/products/enhancer/cleanHtml";
import type { Product } from "@/src/services/products/types/Product";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrZero(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function buildProduct(payload: any): Product {
  const produto = payload?.produto ?? {};
  const categoriaNome = text(produto?.categorias?.nome);

  const variantes = Array.isArray(produto.produto_variacao)
    ? produto.produto_variacao.flatMap((variacao: any) =>
        Array.isArray(variacao?.produto_variacao_item)
          ? variacao.produto_variacao_item.map((item: any) => ({
              sku: text(item?.sku),
              externalId: String(item?.id ?? ""),
              externalSku: text(item?.fornecedor_sku),
              supplierCost: numberOrZero(item?.custo_fornecedor),
              stock: numberOrZero(item?.estoque),
              active: item?.ativo !== false,
              options: [],
            }))
          : []
      )
    : [];

  return {
    id: Number(payload?.produtoId) || undefined,
    externalId: String(payload?.produtoId ?? ""),
    source: "admin",
    supplier: {
      name: text(produto?.fornecedor),
    },
    brand: {
      name: "",
    },
    category: {
      name: categoriaNome,
    },
    title: text(produto?.nome),
    shortDescription: text(produto?.descricao),
    description: text(produto?.detalhes || produto?.descricao),
    bullets: [],
    seo: {
      title: "",
      description: "",
      slug: "",
      tags: [],
    },
    images: [],
    variants: variantes,
    specifications: [],
    externalUrl: text(produto?.link),
  };
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
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

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuario")
    .select("role")
    .eq("user_id", authData.user.id)
    .single();

  if (usuarioError || usuario?.role !== "admin") {
    return NextResponse.json(
      { error: "Acesso negado." },
      { status: 403 }
    );
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON inválido." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(Number(payload?.produtoId)) || Number(payload.produtoId) <= 0) {
    return NextResponse.json(
      { error: "Produto inválido." },
      { status: 400 }
    );
  }

  const produto = buildProduct(payload);

  if (!produto.title && !produto.description) {
    return NextResponse.json(
      { error: "O produto não possui conteúdo suficiente para tratamento." },
      { status: 400 }
    );
  }

  const provider = createAIProvider();

  if (!provider) {
    return NextResponse.json(
      { error: "O serviço de IA não está configurado no servidor." },
      { status: 503 }
    );
  }

  try {
    const resultado = await provider.generateProduct(produto);

    if (!resultado || (!resultado.title && !resultado.description && !resultado.shortDescription)) {
      return NextResponse.json(
        { error: "A IA não retornou conteúdo utilizável." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      produto: {
        nome: text(resultado.title),
        descricao: text(resultado.shortDescription),
        detalhes: cleanHtml(text(resultado.description)),
      },
    });
  } catch (error) {
    console.error("[IA] erro ao tratar produto:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível tratar o produto com IA.",
      },
      { status: 502 }
    );
  }
}
