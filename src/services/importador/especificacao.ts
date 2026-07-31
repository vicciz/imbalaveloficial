import { supabase } from "@/supabaseClient";

import type {
  EspecificacaoImportacao,
} from "./types";

export async function importarEspecificacaoProduto(
  idProduto: number,
  item: EspecificacaoImportacao,
  tiposVariacao: Set<string>
): Promise<boolean> {

  const nome =
    item.nome
      .trim()
      .toLowerCase();

  // Não importa especificações que são tipos de variação
  if (tiposVariacao.has(nome)) {

    console.warn(
      `Especificação "${item.nome}" ignorada porque é um tipo de variação.`
    );

    return false;

  }

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
          item.ordem ?? 0,

      });

  if (error) {

    throw error;

  }

  return true;

}