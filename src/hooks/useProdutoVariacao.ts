"use client";

import { useEffect, useMemo, useState } from "react";

import {
  listarVariacoesProduto,
} from "@/src/services/variacoes";

export function useProdutoVariacao(
  produtoId: number
) {
    const [loading, setLoading] =
      useState(true);

    const [variacoes, setVariacoes] =
      useState<any[]>([]);

    const [
      atributosSelecionados,
      setAtributosSelecionados,
    ] = useState<Record<string, string>>(
      {}
    );

  useEffect(() => {
    carregarVariacoes();
  }, [produtoId]);


  async function carregarVariacoes() {
    setLoading(true);

const { data, error } =
  await listarVariacoesProduto(produtoId);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const lista = data ?? [];

    setVariacoes(lista);

    if (lista.length) {
      const primeira = lista[0];

      const selecionados: Record<
        string,
        string
      > = {};

      primeira.produto_variacao_item.forEach(
        (item: any) => {
          const tipo =
            item.variacao_valor
              ?.variacao_tipo?.nome;

          const valor =
            item.variacao_valor?.valor;

          if (tipo && valor) {
            selecionados[tipo] = valor;
          }
        }
      );

      setAtributosSelecionados(
        selecionados
      );
    }

        setLoading(false);
        console.log(data);
  }
  function selecionarAtributo(
    tipo: string,
    valor: string
  ) {
    setAtributosSelecionados(
      (old) => ({
        ...old,
        [tipo]: valor,
      })
    );
  }

  const variacaoSelecionada = useMemo(() => {
  if (!variacoes.length) {
    return null;
  }

  const encontrada = variacoes.find(
    (variacao: any) =>
      variacao.produto_variacao_item.every(
        (item: any) => {
          const tipo =
            item.variacao_valor
              ?.variacao_tipo?.nome;

          const valor =
            item.variacao_valor?.valor;

          return (
            atributosSelecionados[tipo] ===
            valor
          );
        }
      )
  );

  return encontrada ?? variacoes[0] ?? null;
}, [
  variacoes,
  atributosSelecionados,
]);

  const atributos =
    useMemo(() => {
      const mapa =
        new Map<
          string,
          Set<string>
        >();

      variacoes.forEach(
        (variacao: any) => {
          variacao.produto_variacao_item.forEach(
            (item: any) => {
              const tipo =
                item
                  .variacao_valor
                  ?.variacao_tipo
                  ?.nome;

              const valor =
                item
                  .variacao_valor
                  ?.valor;

              if (
                !mapa.has(tipo)
              ) {
                mapa.set(
                  tipo,
                  new Set()
                );
              }

              mapa
                .get(tipo)
                ?.add(valor);
            }
          );
        }
      );

      return Array.from(
        mapa.entries()
      ).map(
        ([nome, valores]) => ({
          nome,
          valores:
            Array.from(valores),
        })
      );
    }, [variacoes]);

  return {
    loading,

    variacoes,

    atributos,

    atributosSelecionados,

    variacaoSelecionada,

    selecionarAtributo,

    recarregar: carregarVariacoes,
};
}
