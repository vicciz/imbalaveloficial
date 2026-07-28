import { supabase } from "@/supabaseClient";

import type {
  EspecificacaoImportacao,
} from "./types";


export async function importarEspecificacaoProduto(
  idProduto: number,
  item: EspecificacaoImportacao
) {

  const {
    error,
  } =
    await supabase

      .from("produto_especificacao")

      .insert({

        id_produto:
          idProduto,

        grupo:
          item.grupo,

        nome:
          item.nome,

        valor:
          item.valor,

        ordem:
          0,

      });


  if (error) {

    throw error;

  }

}