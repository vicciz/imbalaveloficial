"use client";

import { useEffect, useMemo, useState } from "react";

import {
  listarVariacoesProduto,
} from "@/src/components/produto/types/variacoes";

function buildSelectedAttributesFromVariation(variacao: any): Record<string, string> {
  const selecionados: Record<string, string> = {};

  variacao?.produto_variacao_item?.forEach((item: any) => {
    const tipo = item?.variacao_valor?.variacao_tipo?.nome;
    const valor = item?.variacao_valor?.valor;

    if (!tipo || !valor) {
      return;
    }

    selecionados[tipo] = valor;
  });

  return selecionados;
}

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

      setAtributosSelecionados(
        buildSelectedAttributesFromVariation(primeira)
      );
    }

        setLoading(false);
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

  function selecionarVariacao(idVariacao: number) {
    const variacao = variacoes.find((item: any) => item.id === idVariacao);

    if (!variacao) {
      return;
    }

    setAtributosSelecionados(
      buildSelectedAttributesFromVariation(variacao)
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

  const variacao = encontrada ?? variacoes[0];

  if (!variacao) {
    return null;
  }

  const itemComercial =
  variacao.produto_variacao_item.find(
    (item: any) => item.preco !== undefined
  );

    return {
  ...variacao,

  item: itemComercial,

  preco: itemComercial?.preco ?? 0,

  estoque: itemComercial?.estoque ?? 0,

  sku: itemComercial?.sku ?? null,

  fornecedor_sku: itemComercial?.fornecedor_sku ?? null,

  cj_variant_id: itemComercial?.fornecedor_sku ?? null,

  ativo: itemComercial?.ativo ?? true,

  imagem_principal:
    itemComercial?.imagem_principal ?? null,
};
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
    selecionarVariacao,

    recarregar: carregarVariacoes,
};
}
