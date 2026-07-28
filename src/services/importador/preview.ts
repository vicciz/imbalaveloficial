import type {
  ProdutoImportacao,
} from "./types";

export interface ProdutoPreview
  extends ProdutoImportacao {}

export async function gerarPreview(
  produtos: ProdutoImportacao[]
): Promise<ProdutoPreview[]> {

  return produtos;

}