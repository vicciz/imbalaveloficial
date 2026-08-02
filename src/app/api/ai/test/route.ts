import { NextResponse } from "next/server";

import { getAIProvider } from "@/src/services/ai";
import produto from "@/src/app/produto/produto";

export async function GET() {
  try {
    const ai = getAIProvider();

const resposta =
  await ai.gerarProduto({
    titulo: produto.titulo,

    categoria: produto.categoria,

    marca: produto.marca,

    fornecedor: produto.fornecedor,

    descricao: produto.descricaoLimpa,

    especificacoes: produto.especificacoes,

    variacoes: produto.variacoes,
  });

    return NextResponse.json(resposta);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        erro:
          error instanceof Error
            ? error.message
            : "Erro desconhecido",
      },
      {
        status: 500,
      }
    );
  }
}