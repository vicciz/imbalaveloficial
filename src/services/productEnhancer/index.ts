import produto from "@/src/app/produto/produto";
import { cleanHtml } from "./cleanHtml";
import { extractSpecs } from "./extractSpecs";
import { normalizeSpecs } from "./normalize";
import type { ProdutoEnriquecido } from "./types";

export function enrichProduct(
  titulo: string,
  descricaoHtml: string
): ProdutoEnriquecido {

  const html =
    cleanHtml(descricaoHtml);

  const extraido =
    extractSpecs(html);

return {
  titulo,

  categoria: produto.categoria,

  marca: produto.marca,

  fornecedor: produto.fornecedor,

  descricaoOriginal: descricaoHtml,

  descricaoLimpa: extraido.descricao,

  especificacoes: normalizeSpecs(
    extraido.especificacoes
  ),

  variacoes:
    produto.variacoes.map(
      (variacao) => ({
        sku: variacao.sku,

        preco: variacao.preco,

        estoque: variacao.estoque,

        opcoes: variacao.opcoes,
      })
    ),
};

}