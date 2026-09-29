import { NextRequest, NextResponse } from "next/server";

import {
  buscarProdutos,
} from "@/src/services/cjdropshipping/products";

export async function GET(
  request: NextRequest
) {
  try {
    const keyword =
      request.nextUrl.searchParams.get("keyword");

    if (!keyword) {
      return NextResponse.json({
        success: false,
        message: "Keyword obrigatória",
      });
    }

    const resposta =
      await buscarProdutos(keyword);

    const data: any = resposta?.data;

    const produtos =
      data?.content?.[0]?.productList ??
      data?.productList ??
      [];

    /*
     * Normalizamos o produto da CJ para o formato
     * utilizado pelo frontend.
     */
    const produtosNormalizados = produtos.map(
      (produto: any) => ({
        ...produto,

        id:
          produto.id ??
          produto.pid ??
          "",

        pid:
          produto.pid ??
          produto.id ??
          "",

        productNameEn:
          produto.productNameEn ??
          produto.nameEn ??
          produto.productName ??
          "Produto CJ",

        sellPrice:
          String(
            produto.sellPrice ??
            produto.productSellPrice ??
            produto.price ??
            "0"
          ),

        bigImage:
          produto.bigImage ??
          produto.productImage ??
          produto.image ??
          "",

        supplierName:
          produto.supplierName ?? "",

        sku:
          produto.sku ??
          produto.productSku ??
          "",
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        content: [
          {
            productList: produtosNormalizados,
          },
        ],
      },
    });
  } catch (error) {
    console.error(
      "Erro ao buscar produtos CJ:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar produtos.",
      },
      { status: 500 }
    );
  }
}