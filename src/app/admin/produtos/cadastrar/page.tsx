"use client";

import { AdminLayout } from "@/src/components/layout/Admin";
import FormProduto from "@/src/components/forms/gerenciamentoProduto";

export default function CadastrarProdutoPage() {
  return (
    <AdminLayout>
      <FormProduto modo="criar" />
    </AdminLayout>
  );
}