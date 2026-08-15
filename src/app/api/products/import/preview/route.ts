import { NextRequest, NextResponse } from "next/server";

import { fetchCJProductByPid } from "@/src/services/products/providers/cj/products";
import { mapCJProductToProduct } from "@/src/services/products/providers/cj/mapper";
import type { RawSupplierProduct } from "@/src/services/products/types/RawSupplierProduct";
import type { Product } from "@/src/services/products/types/Product";

function collectWarnings(product: Product): string[] {
  const warnings: string[] = [];

  if (!product.externalId) warnings.push("Produto sem externalId.");
  if (!product.title.trim()) warnings.push("Produto sem título.");
  if (product.images.length === 0) warnings.push("Produto sem imagens.");
  if (product.variants.length === 0) warnings.push("Produto sem variações.");

  product.variants.forEach((variant, index) => {
    if (!variant.externalId) warnings.push(`Variação ${index + 1} sem externalId.`);
    if (!variant.sku) warnings.push(`Variação ${index + 1} sem SKU.`);
    if (variant.supplierCost <= 0) warnings.push(`Variação ${index + 1} sem custo válido.`);
  });

  if (!product.logistics?.originCountryCode && !product.logistics?.originCountryName) {
    warnings.push("Origem do produto não identificada.");
  }

  return warnings;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const provider = String(body?.provider ?? "cj").toLowerCase();
    const externalId = String(body?.externalId ?? body?.pid ?? "").trim();

    if (!externalId) {
      return NextResponse.json(
        { success: false, message: "externalId/PID obrigatório." },
        { status: 400 }
      );
    }

    if (provider !== "cj") {
      return NextResponse.json(
        { success: false, message: `Provider '${provider}' ainda não possui preview implementado.` },
        { status: 400 }
      );
    }

    const raw = await fetchCJProductByPid(externalId);
    const normalized = mapCJProductToProduct(raw);
    const rawProduct: RawSupplierProduct = {
      source: provider,
      externalId,
      raw,
    };

    return NextResponse.json({
      success: true,
      provider,
      externalId,
      raw: rawProduct,
      normalized,
      diagnostics: {
        warnings: collectWarnings(normalized),
        counts: {
          images: normalized.images.length,
          variants: normalized.variants.length,
          specifications: normalized.specifications.length,
        },
      },
    });
  } catch (error) {
    console.error("[products/import/preview]", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erro ao gerar preview da importação.",
      },
      { status: 500 }
    );
  }
}
