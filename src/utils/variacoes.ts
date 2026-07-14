import { supabase } from "@/supabaseClient";
export interface ValorVariacao {
  id: number;
  valor: string;
}

export interface AtributoVariacao {
  nome: string;
  valores: ValorVariacao[];
}

export interface Combinacao {
  [key: string]: ValorVariacao;
}

export function gerarCombinacoes(
  atributos: AtributoVariacao[]
): Combinacao[] {
  if (!atributos.length) return [];

  return atributos.reduce<Combinacao[]>(
    (acc, atributo) => {
      const resultado: Combinacao[] = [];

      for (const item of acc) {
        for (const valor of atributo.valores) {
          resultado.push({
            ...item,
            [atributo.nome]: valor,
          });
        }
      }

      return resultado;
    },
    [{}]
  );
}

export function gerarSku(
  nomeProduto: string,
  indice: number
) {
  const prefixo = nomeProduto
    .replace(/\s+/g, "")
    .substring(0, 4)
    .toUpperCase();

  return `${prefixo}-${String(indice + 1).padStart(3, "0")}`;
}

/* ===========================
   GERAÇÃO DE VARIAÇÕES
=========================== */

export async function criarItensVariacao(
  idVariacao: number,
  idsValores: number[]
) {
  if (!idsValores.length) return;

  const registros = idsValores.map((idValor) => ({
    id_variacao: idVariacao,
    id_valor: idValor,
  }));

  return await supabase
    .from("produto_variacao_item")
    .insert(registros);
}
