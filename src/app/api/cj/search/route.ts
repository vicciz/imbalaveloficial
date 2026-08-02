import { NextRequest, NextResponse } from "next/server";

import {
  buscarProdutos,
} from "@/src/services/cjdropshipping/products";

export async function GET(
  request: NextRequest
) {
  const keyword =
    request.nextUrl.searchParams.get(
      "keyword"
    );

  if (!keyword) {
    return NextResponse.json({
      success: false,
      message: "Keyword obrigatória",
    });
  }

  const produtos =
    await buscarProdutos(keyword);

  return NextResponse.json(produtos);
}