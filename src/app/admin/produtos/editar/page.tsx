"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { AdminLayout } from "@/src/components/layout/Admin";
import FormProduto from "@/src/components/forms/gerenciamentoProduto";

function EditarProdutoContent() {
  const params = useSearchParams();
  const id = Number(params.get("id"));

  return <FormProduto modo="editar" produtoId={id} />;
}

export default function EditarProdutoPage() {
  return (
    <AdminLayout>
      <Suspense fallback={null}>
        <EditarProdutoContent />
      </Suspense>
    </AdminLayout>
  );
}