"use client";

import { useEffect, useMemo, useState } from "react";
import ProdutoHeader from "@/src/app/admin/ModalVariacoes/componentes/ProdutoHeader";
import SeletorAtributo from "@/src/app/admin/ModalVariacoes/componentes/SeletorAtributo";
import ListaValores from "@/src/app/admin/ModalVariacoes/componentes/ListaValores";
import ListaAtributosProduto from "@/src/app/admin/ModalVariacoes/componentes/ListaAtributosProduto";

import { Separator } from "@/src/components/ui/separator";

interface Props {
  produtoId: number;
  produtoNome: string;
  produtoImagem?: string | null;

  variacoesHook: ReturnType<
    typeof import("@/src/hooks/useVariacoes").useVariacoes
  >;
}

export default function AtributosTab({
  produtoId,
  produtoNome,
  produtoImagem,
  variacoesHook,
}: Props) {
  const {
    loading,
    tipos,

    atributosProduto,
    toggleTipoProduto,

    adicionarValor,
    removerValor,
  } = variacoesHook;
  const [tipoSelecionado, setTipoSelecionado] =
    useState<number>();

  const [novoValor, setNovoValor] =
    useState("");

  const tiposAtivos = useMemo(() => {
    return tipos.filter((tipo: any) =>
      atributosProduto.includes(tipo.id)
    );
  }, [tipos, atributosProduto]);

  useEffect(() => {
    if (
      tiposAtivos.length &&
      !tiposAtivos.some(
        (t: any) => t.id === tipoSelecionado
      )
    ) {
      setTipoSelecionado(
        tiposAtivos[0].id
      );
    }
  }, [tiposAtivos, tipoSelecionado]);

  const tipoAtual = useMemo(() => {
    return (
      tiposAtivos.find(
        (t: any) =>
          t.id === tipoSelecionado
      ) ?? null
    );
  }, [tiposAtivos, tipoSelecionado]);

  async function adicionar() {
    if (
      !tipoSelecionado ||
      !novoValor.trim()
    ) {
      return;
    }

    await adicionarValor(
      tipoSelecionado,
      novoValor
    );

    setNovoValor("");
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (

  <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-8">

      {/* ESQUERDA */}

      <div className="min-w-0 space-y-8">

        <ProdutoHeader
          nome={produtoNome}
          imagem={produtoImagem}
        />

        <Separator />

        <SeletorAtributo
          tipos={tiposAtivos}
          tipoSelecionado={
            tipoSelecionado ?? null
          }
          valor={novoValor}
          onSelecionar={
            setTipoSelecionado
          }
          onChange={setNovoValor}
          onAdicionar={adicionar}
        />

        <div className="flex-1 overflow-y-auto">
  {tipoAtual && (
    <ListaValores
      tipo={tipoAtual}
      onRemover={removerValor}
    />
  )}
</div>

      </div>

      {/* DIREITA */}

    <div className="w-[280px] shrink-0 border-l pl-6">
        <ListaAtributosProduto
          tipos={tipos}
          atributosSelecionados={
            atributosProduto
          }
          onToggle={
            toggleTipoProduto
          }
        />

      </div>

    </div>
  );
}