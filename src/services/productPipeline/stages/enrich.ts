import {
  getAIProvider,
} from "@/src/services/ai";

import type {
  ProductPipelineContext,
} from "../types";

export async function enrichStage(
  ctx: ProductPipelineContext
) {

  const ai =
    getAIProvider();

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

  Object.assign(
    ctx.produto,
    resposta
  );

  return ctx;

}