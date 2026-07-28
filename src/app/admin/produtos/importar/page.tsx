"use client";

import { AdminLayout } from "@/src/components/layout/Admin";

import UploadCard from "./componentes/UploadCard";
import PreviewSection from "./componentes/PreviewSection";
import ProgressImport from "./componentes/ProgressImport";

import {
  useImportadorProdutos,
} from "./hooks/useImportadorProdutos";
export default function ImportarProdutosPage() {

  const {

    arquivo,

    loading,

    preview,

    mostrarPreview,

    progresso,

    produtoAtual,

    totalProdutos,

    selecionarArquivo,

    importar,

  } = useImportadorProdutos();

    return (

    <AdminLayout>

      <div
        className="
          mx-auto
          max-w-5xl
          p-8
        "
      >

        <div
          className="
            rounded-3xl
            bg-white
            p-10
            shadow
          "
        >

          <h1
            className="
              text-2xl
              font-bold
            "
          >

            Importar Produtos

          </h1>

          <p
            className="
              mt-2
              text-sm
              text-zinc-500
            "
          >

            Importe produtos através de uma planilha Excel
            (.xlsx) ou um arquivo ZIP contendo a planilha e
            as imagens.

          </p>

          <UploadCard

            arquivo={arquivo}

            onChange={
              selecionarArquivo
            }

            />
      
                <div
            className="
              mt-8
              flex
              justify-end
            "
          >

            <button
              onClick={importar}
              disabled={
                !arquivo ||
                loading
              }
              className="
                rounded-xl
                bg-violet-600
                px-8
                py-3
                font-semibold
                text-white
                transition
                hover:bg-violet-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {
                loading
                  ? "Importando..."
                  : "Importar Produtos"
              }

            </button>

          </div>

          <ProgressImport

            loading={loading}

            progresso={progresso}

            produtoAtual={produtoAtual}

            totalProdutos={totalProdutos}

            />
      
                <PreviewSection

            mostrar={
              mostrarPreview
            }

            preview={
              preview
            }

          />

        </div>

      </div>

    </AdminLayout>

  );

}