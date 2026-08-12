import { NextRequest, NextResponse } from "next/server";
import { buscarProduto } from "@/src/components/produto/types/produtos";
import { calcularFreteProduto } from "@/src/services/frete/calcularFrete";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const produtoId = Number(body?.produtoId);
    const destinationCep = String(body?.cepDestino ?? "");
    const quantity = Math.max(1, Number(body?.quantidade) || 1);
    const variantId = body?.variantId ? String(body.variantId) : null;
    const variantSku = body?.variantSku ? String(body.variantSku) : null;
    const price = Number(body?.preco ?? 0);

    if (!Number.isInteger(produtoId) || produtoId <= 0) {
      return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
    }
    if (destinationCep.replace(/\D/g, "").length !== 8) {
      return NextResponse.json({ error: "Informe um CEP válido." }, { status: 400 });
    }

    const { data: product, error } = await buscarProduto(produtoId);
    if (error || !product) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    const quotes = await calcularFreteProduto({
      product,
      variantId,
      variantSku,
      destinationCep,
      quantity,
      productPrice: price || Number(product.preco ?? 0),
    });

    if (!quotes.length) {
      return NextResponse.json(
        { error: "Nenhuma modalidade de frete disponível para este CEP." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      quotes,
      selected: quotes[0],
    });
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível calcular o frete." },
      { status: 500 }
    );
  }
}
