import { supabase } from "@/supabaseClient";
import { VariantImageMatcher, variantImageMatcher } from "@/src/services/products/images/VariantImageMatcher";
import { variantImageService } from "@/src/services/products/services/VariantImageService";

import type {
  VariacaoImportacao,
} from "./types";

import type { ImagemProdutoSalva } from "./imagem";

function selecionarImagemPrincipal(imagens: ImagemProdutoSalva[]): ImagemProdutoSalva | null {
  if (imagens.length === 0) {
    return null;
  }

  return imagens.find((imagem) => imagem.principal) ?? imagens[0] ?? null;
}

function logMatchDevelopment(variationImage: string | null, matchedImage: ImagemProdutoSalva | null): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.log("===== VARIANT IMAGE MATCH =====");
  console.log("Variation Image:");
  console.log(variationImage ?? "");
  console.log("Filename:");
  console.log(VariantImageMatcher.extractFilename(variationImage));
  console.log("Matched:");
  console.log(matchedImage ? `produto_imagem.id=${matchedImage.id}` : "No match found.");
}



async function obterTipoVariacaoId(
  nome: string
) {

  const tipo =
    nome.trim();


  const {
    data,
  } =
    await supabase

      .from("variacao_tipo")

      .select("id")

      .ilike(
        "nome",
        tipo
      )

      .maybeSingle();


  if (data) {

    return data.id;

  }


  const {
    data: criado,
    error,
  } =
    await supabase

      .from("variacao_tipo")

      .insert({

        nome: tipo,

      })

      .select("id")

      .single();


  if (error) {

    throw error;

  }


  return criado.id;

}



async function obterValorVariacaoId(
  idTipo: number,
  valor: string
) {


  const {
    data,
  } =
    await supabase

      .from("variacao_valor")

      .select("id")

      .eq(
        "id_tipo",
        idTipo
      )

      .ilike(
        "valor",
        valor
      )

      .maybeSingle();


  if (data) {

    return data.id;

  }


  const {
    data: criado,
    error,
  } =
    await supabase

      .from("variacao_valor")

      .insert({

        id_tipo:
          idTipo,

        valor,

      })

      .select("id")

      .single();


  if (error) {

    throw error;

  }


  return criado.id;

}



export async function importarVariacaoProduto(
  idProduto: number,
  item: VariacaoImportacao,
  imagensProduto: ImagemProdutoSalva[] = []
) {


  const idTipo =
    await obterTipoVariacaoId(
      item.tipo
    );


  const idValor =
    await obterValorVariacaoId(
      idTipo,
      item.valor
    );



const {
  data: variacao,
  error,
} =
await supabase

  .from("produto_variacao")

  .insert({

    id_produto: idProduto,

  })

  .select("id")

  .single();


  if (error) {

    throw error;

  }



  const {

    error: erroItem,

  } =
await supabase
  .from("produto_variacao_item")
  .insert({
    id_variacao: variacao.id,
    id_valor: idValor,

    preco: item.preco,
    estoque: item.estoque,

    sku: item.sku ?? null,
    ativo: true,
    imagem_principal: item.imagem_principal ?? null,
  });

  if (erroItem) {

    throw erroItem;

  }

  const imagemVariacao = item.imagem_principal ?? null;
  const matchedImage = variantImageMatcher.match(imagemVariacao, imagensProduto) ?? selecionarImagemPrincipal(imagensProduto);

  logMatchDevelopment(imagemVariacao, matchedImage);

  if (matchedImage) {
    await variantImageService.linkImageToVariation(variacao.id, matchedImage.id);
  }
}