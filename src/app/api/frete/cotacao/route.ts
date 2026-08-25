import { NextRequest, NextResponse } from "next/server";
import { buscarProduto } from "@/src/components/produto/types/produtos";
import {
  calcularFreteCarrinho,
  calcularFreteProduto,
  type FreightCartItemInput,
} from "@/src/services/frete/calcularFrete";
import { getUsdBrlRate } from "@/src/services/cambio/usdBrl";
import { supabase } from "@/supabaseClient";

async function buscarItemVariacaoParaFrete(id: number) {
  return await supabase
    .from("produto_variacao_item")
    .select("fornecedor_sku,sku,id_variacao")
    .eq("id", id)
    .maybeSingle();
}

function numero(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const destinationCep = String(body?.cepDestino ?? "").replace(/\D/g, "");

    if (destinationCep.length !== 8) {
      return NextResponse.json({ error: "Informe um CEP válido." }, { status: 400 });
    }

    const usdBrl = await getUsdBrlRate();

    // Checkout/carrinho: uma única cotação por grupo de origem/warehouse.
    if (Array.isArray(body?.itens)) {
      if (!body.itens.length) {
        return NextResponse.json({ error: "Nenhum item selecionado." }, { status: 400 });
      }

      const inputs: FreightCartItemInput[] = [];

      for (const rawItem of body.itens) {
        const produtoId = Number(rawItem?.produtoId);
        if (!Number.isInteger(produtoId) || produtoId <= 0) {
          return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
        }

        const { data: product, error } = await buscarProduto(produtoId);
        if (error || !product) {
          return NextResponse.json(
            { error: `Produto ${produtoId} não encontrado.` },
            { status: 404 }
          );
        }

        const quantidade = Math.max(1, Math.floor(numero(rawItem?.quantidade, 1)));
        let variantId = rawItem?.variantId ? String(rawItem.variantId) : null;
        let variantSku = rawItem?.variantSku ? String(rawItem.variantSku) : null;

        const variantItemId = Number(rawItem?.variantItemId);
        if ((!variantId || !variantSku) && Number.isInteger(variantItemId) && variantItemId > 0) {
          const { data: item, error: itemError } = await buscarItemVariacaoParaFrete(variantItemId);
          if (itemError) {
            throw new Error("Não foi possível localizar a variante selecionada.");
          }
          variantId = variantId ?? item?.fornecedor_sku ?? null;
          variantSku = variantSku ?? item?.sku ?? null;
        }

        inputs.push({
          product,
          variantId,
          variantSku,
          destinationCep,
          quantity: quantidade,
          productPrice: numero(rawItem?.preco ?? product.preco, 0),
        });
      }

      const resultado = await calcularFreteCarrinho(
        inputs,
        destinationCep,
        usdBrl.rate
      );

      return NextResponse.json({
        totalBRL: resultado.totalBRL,
        grupos: resultado.grupos,
        // Compatibilidade com o frontend antigo: o primeiro grupo é o selecionado.
        selected: resultado.grupos[0] ?? null,
        usdBrl: {
          rate: usdBrl.rate,
          source: usdBrl.source,
          updatedAt: usdBrl.timestamp
            ? new Date(usdBrl.timestamp * 1000).toISOString()
            : new Date().toISOString(),
        },
      });
    }

    // Checkout de produto individual.
    const produtoId = Number(body?.produtoId);
    const quantity = Math.max(1, Math.floor(numero(body?.quantidade, 1)));
    const variantId = body?.variantId ? String(body.variantId) : null;
    const variantSku = body?.variantSku ? String(body.variantSku) : null;
    const variantItemId = body?.variantItemId ? Number(body.variantItemId) : null;
    const price = numero(body?.preco, 0);

    if (!Number.isInteger(produtoId) || produtoId <= 0) {
      return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
    }

    const { data: product, error } = await buscarProduto(produtoId);
    if (error || !product) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    let resolvedVariantId = variantId;
    let resolvedVariantSku = variantSku;

    if (Number.isInteger(variantItemId) && variantItemId > 0) {
      const { data: item, error: itemError } = await buscarItemVariacaoParaFrete(variantItemId);
      if (itemError) {
        throw new Error("Não foi possível localizar a variante selecionada.");
      }
      resolvedVariantId = resolvedVariantId ?? item?.fornecedor_sku ?? null;
      resolvedVariantSku = resolvedVariantSku ?? item?.sku ?? null;
    }

    const quotes = await calcularFreteProduto({
      product,
      variantId: resolvedVariantId,
      variantSku: resolvedVariantSku,
      destinationCep,
      quantity,
      productPrice: price || numero(product.preco, 0),
    });

    if (!quotes.length) {
      return NextResponse.json(
        { error: "Nenhuma modalidade de frete disponível para este CEP." },
        { status: 422 }
      );
    }

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
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível calcular o frete.",
      },
      { status: 500 }
    );
  }
}
