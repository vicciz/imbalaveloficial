import { supabase } from "@/supabaseClient";

import type {
  VariacaoImportacao,
} from "./types";



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
  item: VariacaoImportacao
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

        id_produto:
          idProduto,

        preco:
          item.preco,

        estoque:
          item.estoque,

        ativo:
          true,

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

        id_variacao:
          variacao.id,

        id_valor:
          idValor,

      });

  if (erroItem) {

    throw erroItem;

  }
}