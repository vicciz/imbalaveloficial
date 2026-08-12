import { NextRequest, NextResponse } from "next/server";
import { buscarProduto } from "@/src/components/produto/types/produtos";
import { calcularFreteProduto } from "@/src/services/frete/calcularFrete";
import { getUsdBrlRate } from "@/src/services/cambio/usdBrl";
import { supabase } from "@/supabaseClient";



async function buscarItemVariacaoParaFrete(id: number) {
  return await supabase
    .from("produto_variacao_item")
    .select("fornecedor_sku")
    .eq("id", id)
    .maybeSingle();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const produtoId = Number(body?.produtoId);
    const destinationCep = String(body?.cepDestino ?? "");
    const quantity = Math.max(1, Number(body?.quantidade) || 1);
    const variantId = body?.variantId ? String(body.variantId) : null;
    const variantSku = body?.variantSku ? String(body.variantSku) : null;
    const variantItemId = body?.variantItemId ? Number(body.variantItemId) : null;
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

    let resolvedVariantId = variantId;

    if (!resolvedVariantId && Number.isInteger(variantItemId) && variantItemId > 0) {
      const { data: item, error: itemError } = await buscarItemVariacaoParaFrete(variantItemId);

      if (itemError) {
        throw new Error("Não foi possível localizar a variante selecionada.");
      }

      resolvedVariantId = item?.fornecedor_sku ?? null;
    }

    const quotes = await calcularFreteProduto({
      product,
      variantId: resolvedVariantId,
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

    const usdBrl = await getUsdBrlRate();

    const quotesWithBrl = quotes.map((quote) => ({
      ...quote,
      priceBRL:
        quote.currency === "USD"
          ? Number((quote.price * usdBrl.rate).toFixed(2))
          : Number(quote.price.toFixed(2)),
    }));

    return NextResponse.json({
      quotes: quotesWithBrl,
      selected: quotesWithBrl[0],
      usdBrl: {
        rate: usdBrl.rate,
        source: usdBrl.source,
        updatedAt: usdBrl.timestamp
          ? new Date(usdBrl.timestamp * 1000).toISOString()
          : new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível calcular o frete." },
      { status: 500 }
    );
  }
}
