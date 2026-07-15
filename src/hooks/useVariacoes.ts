"use client";

import { useEffect, useState } from "react";

import {
  listarTiposProduto,
  adicionarTipoProduto,
  removerTipoProduto,
  listarTiposVariacaoCompleto,
  listarVariacoesProduto,
  criarTipoVariacao,
  criarValorVariacao,
  excluirValorVariacao,
  salvarVariacao,
  editarTipoVariacao,
  excluirTipoVariacao,
} from "@/src/services/produto/variacoes";

import {
  gerarCombinacoes,
  gerarSku,
} from "@/src/utils/variacoes";

import {
  criarVariacaoProduto,
  adicionarItemVariacao,
  excluirVariacoesProduto,
} from "@/src/services/produto/variacoes";

export function useVariacoes(
  produtoId: number
) {
  const [loading, setLoading] =
    useState(false);

  const [gerando, setGerando] =
    useState(false);

  const [tipos, setTipos] =
    useState<any[]>([]);

  const [variacoes, setVariacoes] =
    useState<any[]>([]);

  const [
    atributosProduto,
    setAtributosProduto,
  ] = useState<number[]>([]);

  async function carregarTudo() {
    if (!produtoId) return;

    setLoading(true);

    try {
      const [
        { data: tipos },
        { data: variacoes },
        { data: produtoTipos },
      ] = await Promise.all([
        listarTiposVariacaoCompleto(),
        listarVariacoesProduto(produtoId),
        listarTiposProduto(produtoId),
      ]);

      setTipos(tipos ?? []);
      setVariacoes(variacoes ?? []);

      setAtributosProduto(
        produtoTipos?.map(
          (item: any) => item.id_tipo
        ) ?? []
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleTipoProduto(
    idTipo: number,
    ativo: boolean
  ) {
    if (ativo) {
      await adicionarTipoProduto(
        produtoId,
        idTipo
      );
    } else {
      await removerTipoProduto(
        produtoId,
        idTipo
      );
    }

    await carregarTudo();
  }

  async function adicionarTipo(
    nome: string
  ) {
    await criarTipoVariacao(nome);
    await carregarTudo();
  }

  async function alterarTipo(
    id: number,
    nome: string
  ) {
    await editarTipoVariacao(id, nome);
    await carregarTudo();
  }

  async function removerTipo(
    id: number
  ) {
    await excluirTipoVariacao(id);
    await carregarTudo();
  }

  async function adicionarValor(
    idTipo: number,
    valor: string
  ) {
    await criarValorVariacao(
      idTipo,
      valor
    );

    await carregarTudo();
  }

  async function removerValor(
    id: number
  ) {
    await excluirValorVariacao(id);
    await carregarTudo();
  }

  async function atualizarVariacao(
    id: number,
    dados: {
      sku: string;
      preco: number;
      estoque: number;
      ativo: boolean;
    }
  ) {
    await salvarVariacao(id, dados);
  }
  async function gerarTodasCombinacoes(
    nomeProduto: string
  ) {
    setGerando(true);

    try {
      await excluirVariacoesProduto(
        produtoId
      );

      const atributos = tipos
        .filter((tipo: any) =>
          atributosProduto.includes(
            tipo.id
          )
        )
        .map((tipo: any) => ({
          nome: tipo.nome,
          valores:
            tipo.variacao_valor.map(
              (v: any) => v.valor
            ),
        }));

      const combinacoes =
        gerarCombinacoes(
          atributos
        );

      for (
        let i = 0;
        i < combinacoes.length;
        i++
      ) {
        const combinacao =
          combinacoes[i];

        const {
          data: variacao,
        } =
          await criarVariacaoProduto(
            produtoId,
            gerarSku(
              nomeProduto,
              i
            ),
            0,
            0
          );

        if (!variacao) {
          continue;
        }

        for (const tipo of tipos) {
          const valorSelecionado =
            combinacao[tipo.nome];

          const valor =
            tipo.variacao_valor.find(
              (v: any) =>
                v.valor ===
                valorSelecionado
            );

          if (!valor) {
            continue;
          }

          await adicionarItemVariacao(
            variacao.id,
            valor.id
          );
        }
      }

      await carregarTudo();
    } finally {
      setGerando(false);
    }
  }

    useEffect(() => {
    carregarTudo();
  }, [produtoId]);

  return {
    loading,
    gerando,

    tipos,
    variacoes,
    atributosProduto,

    adicionarTipo,
    alterarTipo,
    removerTipo,

    adicionarValor,
    removerValor,

    gerarTodasCombinacoes,
    atualizarVariacao,

    toggleTipoProduto,

    recarregar: carregarTudo,
  };
}