"use client";

import { AdminLayout } from "@/src/components/layout/Admin";

import CjSearch from "@/src/app/admin/cjdropshipping/components/CjSearch";
import CjProductGrid from "@/src/app/admin/cjdropshipping/components/CjProductGrid";
import CjImportDialog from "@/src/app/admin/cjdropshipping/components/CjImportDialog";

import { useCJProducts } from "@/src/hooks/cjdropshipping/useCJProducts";
import { useCJImport } from "@/src/hooks/cjdropshipping/useCJImport";

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

          <p className="text-slate-500">
            Pesquise produtos no catálogo do CJ Dropshipping.
          </p>
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