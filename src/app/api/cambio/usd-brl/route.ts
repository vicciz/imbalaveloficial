import { NextResponse } from "next/server";
import { getUsdBrlRate } from "@/src/services/cambio/usdBrl";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quote = await getUsdBrlRate();

    return NextResponse.json({
      ...quote,
      currencyPair: "USD/BRL",
      updatedAt: quote.timestamp
        ? new Date(quote.timestamp * 1000).toISOString()
        : new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao obter USD/BRL:", error);

    return NextResponse.json(
      {
        error: "Não foi possível obter a cotação USD/BRL.",
      },
      { status: 503 }
    );
  }
}
