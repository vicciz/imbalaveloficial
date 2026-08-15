"use client";

import { AdminLayout } from "@/src/components/layout/Admin";

import CjSearch from "@/src/app/admin/fornecedores/cjdropshipping/components/CjSearch";
import CjProductGrid from "@/src/app/admin/fornecedores/cjdropshipping/components/CjProductGrid";
import CjImportDialog from "@/src/app/admin/fornecedores/cjdropshipping/components/CjImportDialog";

import { useCJProducts } from "@/src/hooks/cjdropshipping/useCJProducts";
import { useCJImport } from "@/src/hooks/cjdropshipping/useCJImport";
import Link from "next/link";

export default function CJDropshippingPage() {
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

        <CjSearch
          value={busca}
          loading={loading}
          onChange={setBusca}
          onSearch={pesquisar}
          
        />

        <CjProductGrid
          produtos={produtos}
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