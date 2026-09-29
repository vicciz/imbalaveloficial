"use client";

import { AdminLayout } from "@/src/components/layout/Admin";

import CjSearch from "@/src/app/admin/fornecedores/cjdropshipping/components/CjSearch";
import CjProductGrid from "@/src/app/admin/fornecedores/cjdropshipping/components/CjProductGrid";
import CjImportDialog from "@/src/app/admin/fornecedores/cjdropshipping/components/CjImportDialog";

import { useCJProducts } from "@/src/hooks/cjdropshipping/useCJProducts";
import { useCJImport } from "@/src/hooks/cjdropshipping/useCJImport";
import Link from "next/link";
import {useState} from "react";

export default function CJDropshippingPage() {
  const [cepDestino, setCepDestino] =
    useState("");
  
  const {
    busca,
    setBusca,
    loading,
    produtos,
    pesquisar,
  } = useCJProducts();

  const {
    produtoSelecionado,
    loading: importando,
    abrirImportacao,
    fecharImportacao,
    importarProduto,
  } = useCJImport();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Importar do CJ
          </h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-slate-500">
              Pesquise produtos no catálogo do CJ Dropshipping.
            </p>
            <Link
              href="/admin/fornecedores/cjdropshipping/teste"
              className="inline-flex w-fit items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
            >
              Diagnóstico da API
            </Link>
          </div>
        </div>

        <div className="flex items-end gap-3">

        <div>
          <label className="mb-1 block text-sm font-medium">
            CEP de destino
          </label>

          <input
            value={cepDestino}
            onChange={(e) =>
              setCepDestino(e.target.value)
            }
            placeholder="00000-000"
            maxLength={9}
            className="h-10 w-40 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-violet-500"
          />
        </div>

      </div>
        <CjSearch
          value={busca}
          loading={loading}
          onChange={setBusca}
          onSearch={pesquisar}
          
        />

        <CjProductGrid
          produtos={produtos}
          cepDestino={cepDestino}
          onImport={abrirImportacao}
        />

        <CjImportDialog
          produto={produtoSelecionado}
          open={!!produtoSelecionado}
          loading={importando}
          onClose={fecharImportacao}
          onImport={importarProduto}
        />
      </div>
    </AdminLayout>
  );
}