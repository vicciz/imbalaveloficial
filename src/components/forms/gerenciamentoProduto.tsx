"use client";

import { useEffect, useState } from "react";

import {
  Produto,
  buscarProdutoPorId,
  cadastrarProduto,
  editarProduto,
} from "@/src/services/produtos";

import { listarCategorias } from "@/src/services/categorias";

import { salvarGaleriaProduto } from "@/src/services/galeriaProduto";

import {
  FormProdutoProps,
  Categoria,
  ImagemFormulario,
} from "../admin/common/types";

import Informacoes from "../admin/common/Informacoes";
import Configuracoes from "../admin/common/Configuracoes";
import MarkdownEditor from "../admin/common/MarkdownEditor";
import GaleriaImagens from "../admin/common/GaleriaImagens";
import CropperModal from "../admin/common/CropperModal";

import {
  Card,
  CardContent,
} from "@/src/components/ui/card";

import { Button } from "@/src/components/ui/button";

import {
  Loader2,
  Save,
} from "lucide-react";

export default function FormProduto({

  modo,

  produtoId,

}: FormProdutoProps) {

  const [produto, setProduto] =
    useState<Partial<Produto>>({});

  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [imagens, setImagens] =
    useState<ImagemFormulario[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [cropOpen, setCropOpen] =
    useState(false);

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
  } =
    await listarCategorias();

  if (error) {

    console.error(error);

    return;

  }

  setCategorias(data ?? []);

}

async function carregarProduto() {

  setLoading(true);

  const {
    data,
    error,
  } =
    await buscarProdutoPorId(
      produtoId!
    );

  if (error) {

    console.error(error);

    setLoading(false);

    return;

  }

  setProduto(data ?? {});

  setImagens(

    (data?.produto_imagem ?? [])

      .map((imagem) => ({

        id: imagem.id,

        caminho: imagem.caminho,

        preview: imagem.caminho,

        principal:
          imagem.principal,

        ordem:
          imagem.ordem,

      }))

  );

  setLoading(false);

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

    // ===========================
    // CADASTRAR
    // ===========================

    if (modo === "criar") {

      const {
        data,
        error,
      } = await cadastrarProduto(produto);

      if (error) {

        throw error;

      }

      idProduto = data!.id;

    }

    // ===========================
    // EDITAR
    // ===========================

    else {

      const { error } =
        await editarProduto(
          produtoId!,
          produto
        );

      if (error) {

        throw error;

      }

    }

    // ===========================
    // GALERIA
    // ===========================

    await salvarGaleriaProduto({

      idProduto: idProduto!,

      imagens,

    });

    alert(

      modo === "criar"

        ? "Produto cadastrado!"

        : "Produto atualizado!"

    );

  }

  catch (error: any) {

    console.error(error);

    alert(

      error.message ??

      "Erro ao salvar produto."

    );

  }

  finally {

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

        <p className="text-muted-foreground mt-1">

          Preencha as informações do produto.

        </p>

      </div>

      <Button

        size="lg"

        onClick={salvarProduto}

        disabled={salvando}

      >

        {

          salvando ?

          <>

            <Loader2

              className="mr-2 h-4 w-4 animate-spin"

            />

            Salvando...

          </>

          :

          <>

            <Save

              className="mr-2 h-4 w-4"

            />

            Salvar Produto

          </>

        }

      </Button>

    </div>

    {/* Conteúdo */}

    <div className="grid xl:grid-cols-3 gap-8">

      {/* Coluna esquerda */}

      <div className="xl:col-span-2 space-y-8">

        <Informacoes

          produto={produto}

          setProduto={setProduto}

        />

        <MarkdownEditor

          value={produto.detalhes ?? ""}

          onChange={(texto)=>

            setProduto((prev)=>({

              ...prev,

              detalhes:texto,

            }))

          }

        />

        <GaleriaImagens

          imagens={imagens}

          setImagens={setImagens}

          abrirCropper={abrirCropper}

        />

      </div>

      {/* Coluna direita */}

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

            imagemSelecionada.preview

          }

          onClose={fecharCropper}

          onSave={(blob)=>{

            console.log(blob);

            fecharCropper();

          }}

        />

      )

    }

  </div>

);
}