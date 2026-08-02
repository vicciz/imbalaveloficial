import { NextRequest, NextResponse } from "next/server";

import {
  importarProdutoCJ,
} from "@/src/services/cjdropshipping/import";

export async function POST(
  request: NextRequest
) {
  try {

    const body = await request.json();

    console.log("BODY:", body);

    const { pid } = body;

    console.log("PID:", pid);

    if (!pid) {
      return NextResponse.json(
        {
          success: false,
          message: "PID obrigatório.",
        },
        { status: 400 }
      );
    }

    const produto =
      await importarProdutoCJ(pid);

    return NextResponse.json({
      success: true,
      produto,
    });

  } catch (error: any) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ??
          "Erro ao importar.",
      },
      {
        status: 500,
      }
    );

  }
}