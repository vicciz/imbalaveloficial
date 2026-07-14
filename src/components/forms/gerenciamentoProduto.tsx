"use client";

import { useEffect, useState } from "react";

import {
  Produto,
  buscarProdutoPorId,
  cadastrarProduto,
  editarProduto,
} from "@/src/services/produtos";

import {
  listarCategorias,
} from "@/src/services/categorias";

import {
  listarTiposVariacaoCompleto,
} from "@/src/services/variacoes";

import {
  salvarGaleriaProduto,
} from "@/src/services/galeriaProduto";

import {
  FormProdutoProps,
  Categoria,
  ImagemFormulario,
} from "../Admin/common/types";

import Informacoes from "../Admin/common/Informacoes";
import Configuracoes from "../Admin/common/Configuracoes";
import MarkdownEditor from "../Admin/common/MarkdownEditor";
import GaleriaImagens from "../Admin/common/GaleriaImagens";
import CropperModal from "../Admin/common/CropperModal";
import VariacoesProduto from "../Admin/common/VariacoesProduto";

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

    setImagens(
      (data?.produto_imagem ?? []).map(
        (imagem) => ({
          id: imagem.id,
          file: undefined,
          caminho: imagem.caminho,
          preview: imagem.caminho,
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
        image,
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

const imagensGerais =
  imagens.filter(
    (img) =>
      img.idValor == null
  );

const imagensDaCor = (
  idValor: number
) =>
  imagens.filter(
    (img) =>
      img.idValor === idValor
  );

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
          imagens={imagensGerais}
          setImagens={setImagens}
          abrirCropper={abrirCropper}
        />

        {/* --------------------- */}
        {/* IMAGENS POR COR */}
        {/* --------------------- */}

        {
          cores.length > 0 && (

            <div className="space-y-8">

              <div>

                <h2 className="text-2xl font-bold">

                  Imagens por Cor

                </h2>

                <p className="text-muted-foreground">

                  Cada cor pode possuir sua própria galeria.

                </p>

              </div>

              {

                cores.map((cor: any) => (

                  <GaleriaImagens

                    key={cor.id}

                    titulo={cor.valor}

                    imagens={imagensDaCor(
                      cor.id
                    )}

                    setImagens={setImagens}

                    abrirCropper={abrirCropper}

                    idValor={cor.id}

                  />

                ))

              }

            </div>

          )
        }

        <VariacoesProduto
          produtoId={produtoId}
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
            imagemSelecionada.preview
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