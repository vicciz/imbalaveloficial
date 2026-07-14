"use client";

import { useEffect, useMemo, useState } from "react";
import HeaderResumo from "@/src/app/admin/ModalVariacoes/componentes/HeaderResumo";
import TabelaCombinacoes from "@/src/app/admin/ModalVariacoes/componentes/TabelaCombinacoes";

import BotaoSalvar from "@/src/app/admin/ModalVariacoes/CombinaçoesTab/componentes/BotaoSalvar";
import BarraPesquisa from "@/src/app/admin/ModalVariacoes/CombinaçoesTab/componentes/BarraPesquisa";

interface Props {
  produtoId: number;
  produtoNome: string;
  produtoImagem?: string | null;

  variacoesHook: ReturnType<
    typeof import("@/src/hooks/useVariacoes").useVariacoes
  >;
}

type CampoVariacao = "sku" | "preco" | "estoque" | "ativo";

export default function CombinacoesTab({
  produtoId,
  produtoNome,
  produtoImagem,
  variacoesHook,
}: Props) {
  const {
  loading,
  tipos,
  variacoes,
  atualizarVariacao,
  recarregar,
} = variacoesHook;

  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");
  const [dados, setDados] = useState<any[]>([]);

  useEffect(() => {
    setDados(variacoes);
  }, [variacoes]);

  const variacoesFiltradas = useMemo(() => {
    if (!busca.trim()) return dados;

    const texto = busca.toLowerCase();

    return dados.filter((variacao: any) => {
      if (variacao.sku?.toLowerCase().includes(texto)) return true;

      return variacao.produto_variacao_item.some(
        (item: any) =>
          item.variacao_valor?.valor
            ?.toLowerCase()
            .includes(texto)
      );
    });
  }, [dados, busca]);

  function alterarCampo(
    id: number,
    campo: CampoVariacao,
    valor: any
  ) {
    setDados((old) =>
      old.map((item) =>
        item.id === id ? { ...item, [campo]: valor } : item
      )
    );
  }

  function duplicarPreco() {
    const preco = prompt("Preço para todas as variações:");
    if (preco === null) return;

    const valor = Number(preco.replace(",", "."));
    if (isNaN(valor)) return;

    setDados((old) =>
      old.map((item) => ({ ...item, preco: valor }))
    );
  }

  function duplicarEstoque() {
    const estoque = prompt("Estoque para todas as variações:");
    if (estoque === null) return;

    const valor = Number(estoque);
    if (isNaN(valor)) return;

    setDados((old) =>
      old.map((item) => ({ ...item, estoque: valor }))
    );
  }

  function ativarTodas() {
    setDados((old) =>
      old.map((item) => ({ ...item, ativo: true }))
    );
  }

  function desativarTodas() {
    setDados((old) =>
      old.map((item) => ({ ...item, ativo: false }))
    );
  }

  async function salvarTudo() {
    setSalvando(true);

    try {
      const resultado =
await Promise.all(
        dados.map((item) =>
          atualizarVariacao(item.id, {
            sku: item.sku,
            preco: item.preco,
            estoque: item.estoque,
            ativo: item.ativo,
          })
        )
      );
console.log(resultado);
      await recarregar();
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderResumo
        produtoNome={produtoNome}
        produtoImagem={produtoImagem}
        atributos={tipos.length}
        combinacoes={variacoes.length}

        onGerar={() =>
          variacoesHook.gerarTodasCombinacoes(
            produtoNome
          )
        }

        onDuplicarPreco={duplicarPreco}
        onDuplicarEstoque={duplicarEstoque}
        onAtivarTodas={ativarTodas}
        onDesativarTodas={desativarTodas}
      />

      <BarraPesquisa
        value={busca}
        onChange={setBusca}
      />

      {dados.length > 0 && (
        <BotaoSalvar
          salvando={salvando}
          onSalvar={salvarTudo}
        />
      )}

      <TabelaCombinacoes
        variacoes={variacoesFiltradas}
        onAlterar={alterarCampo}
      />
    </div>
  );
}