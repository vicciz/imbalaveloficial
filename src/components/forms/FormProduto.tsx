"use client";

import { useEffect, useState } from "react";

import {
  Produto,
  buscarProdutoPorId,
  cadastrarProduto,
  editarProduto,
} from "@/src/components/produto/types/produtos";

import {
  listarCategorias,
} from "@/src/services/categoria/categorias";

import {
  listarTiposVariacaoCompleto,
} from "@/src/components/produto/types/variacoes";
import type { ProdutoVariacao } from "@/src/components/produto/types/produtos";
import {
  salvarGaleriaProduto,
} from "@/src/components/produto/layout/galeriaProduto";

import {
  FormProdutoProps,
  Categoria,
  ImagemFormulario,
} from "../Admin/common/types";
import {
  obterUrlImagem,
} from "@/src/components/produto/Components/galeria/utils";

import Informacoes from "../produto/informacoes/Informacoes";
import Configuracoes from "../produto/informacoes/Configuracoes";
import MarkdownEditor from "../produto/variacoes/MarkdownEditor";
import { Button } from "@/src/components/ui/button";

import {
  Loader2,
  Save,
} from "lucide-react";
import GaleriaImagens from "../produto/Components/galeria/GaleriaImagens";

import CropperModal from "../produto/Components/galeria/CropperModal";
import { VariacoesEditor } from "../produto/variacoes";

export default function FormProduto({
  modo,
  produtoId,
}: FormProdutoProps) {

  const [produto, setProduto] =
    useState<Partial<Produto>>({});

  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [cores, setCores] =
    useState<any[]>([]);

  const [imagens, setImagens] =
    useState<ImagemFormulario[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [cropOpen, setCropOpen] =
    useState(false);
  const [variacoes, setVariacoes] =
    useState<ProdutoVariacao[]>([]);
  const [
    imagemSelecionada,
    setImagemSelecionada,
  ] =
    useState<ImagemFormulario>();

    useEffect(() => {
  carregarCategorias();

  if (
    modo === "editar" &&
    produtoId
  ) {
    carregarProduto();
  }
}, []);

async function carregarCategorias() {
  const {
    data,
    error,
  } = await listarCategorias();

  if (error) {
    console.error(error);
    return;
  }

  setCategorias(data ?? []);
}

async function carregarProduto() {
  if (!produtoId) return;

  setLoading(true);

  try {
    const {
      data,
      error,
    } = await buscarProdutoPorId(
      produtoId
    );

    if (error) {
      throw error;
    }

    setProduto(data ?? {});
    setVariacoes(
      data?.produto_variacao ?? []
    );
    console.log("Produto:", data);
    console.log(
      "Variações:",
      data?.produto_variacao
    );

    setImagens(
  (data?.produto_imagem ?? []).map(
    (imagem) => ({
      id: imagem.id,

      file: undefined,

      caminho: imagem.caminho,

      url: obterUrlImagem(
        imagem.caminho
      ),

      principal:
        imagem.principal,

      ordem:
        imagem.ordem,

      idValor:
        imagem.id_valor,
    })
  )
    );

    const {
      data: tipos,
    } =
      await listarTiposVariacaoCompleto();

    const tipoCor =
      tipos?.find(
        (tipo: any) =>
          tipo.nome
            .toLowerCase() ===
          "cor"
      );

    setCores(
      tipoCor?.variacao_valor ??
        []
    );
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}

function abrirCropper(
  imagem: ImagemFormulario
) {
  setImagemSelecionada(
    imagem
  );

  setCropOpen(true);
}

function fecharCropper() {
  setCropOpen(false);
}

async function salvarProduto() {
  try {
    setSalvando(true);

    let idProduto = produtoId;

    if (modo === "criar") {
      const {
        data,
        error,
      } = await cadastrarProduto(
        produto
      );

      if (error) {
        throw error;
      }

      idProduto = data!.id;
    } else {
      const {
        categorias,
        produto_imagem,
        produto_variacao,
        image,
        preco,
        estoque,
        ...dadosProduto
      } = produto;

      const { error } =
        await editarProduto(
          produtoId!,
          dadosProduto
        );

      if (error) {
        throw error;
      }
    }

  await salvarGaleriaProduto({
  idProduto: idProduto!,
  imagens,
  });

  // Atualiza o estado local com os ids retornados
  const { data } = await buscarProdutoPorId(idProduto!);

  if (data) {
    setProduto(data);

    setImagens(
      (data.produto_imagem ?? []).map((img) => ({
        id: img.id,
        file: undefined,
        caminho: img.caminho,
        url: obterUrlImagem(img.caminho),
        principal: img.principal,
        ordem: img.ordem,
        idValor: img.id_valor,
      }))
    );
}

    alert(
      modo === "criar"
        ? "Produto cadastrado!"
        : "Produto atualizado!"
    );
  } catch (error: any) {
    console.error(error);

    alert(
      error.message ??
        "Erro ao salvar produto."
    );
  } finally {
    setSalvando(false);
  }
}

if (loading) {
  return (
    <div
      className="
        flex
        items-center
        justify-center
        h-[500px]
      "
    >
      <Loader2
        className="
          w-8
          h-8
          animate-spin
        "
      />
    </div>
  );
}

return (
  <div className="space-y-8">

    {/* Cabeçalho */}

    <div className="flex items-center justify-between">

      <div>

        <h1 className="text-3xl font-bold">

          {
            modo === "criar"
              ? "Cadastrar Produto"
              : "Editar Produto"
          }

        </h1>

        <p className="mt-1 text-muted-foreground">

          Preencha as informações do produto.

        </p>

      </div>

      <Button
        size="lg"
        onClick={salvarProduto}
        disabled={salvando}
      >

        {
          salvando
            ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            )
            : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Produto
              </>
            )
        }

      </Button>

    </div>

    {/* Conteúdo */}

    <div className="grid xl:grid-cols-3 gap-8">

      {/* ESQUERDA */}

      <div className="xl:col-span-2 space-y-8">

        <Informacoes
          produto={produto}
          setProduto={setProduto}
        />

        <MarkdownEditor
          value={produto.detalhes ?? ""}
          onChange={(texto) =>
            setProduto((old) => ({
              ...old,
              detalhes: texto,
            }))
          }
        />

        {/* --------------------- */}
        {/* GALERIA GERAL */}
        {/* --------------------- */}

        <GaleriaImagens
          titulo="Galeria Geral"
          imagens={imagens}
          setImagens={setImagens}
          abrirCropper={abrirCropper}
        />

        <VariacoesEditor
          produto={produto as Produto}
          variacoes={produto.produto_variacao ?? []}
          imagens={imagens}
          onRefresh={carregarProduto}
        />

      </div>

      {/* DIREITA */}

      <div className="space-y-8">

        <Configuracoes

          produto={produto}

          setProduto={setProduto}

          categorias={categorias}

        />

      </div>

    </div>

    {/* Cropper */}

    {

      imagemSelecionada && (

        <CropperModal

          open={cropOpen}

          image={
            imagemSelecionada.url
          }

          onClose={fecharCropper}

          onSave={(blob) => {

            console.log(blob);

            fecharCropper();

          }}

        />

      )

    }

  </div>
);
}