import React, { Suspense } from 'react';
import ProdutoCliente from '@/src/app/pageConversao/ProdutoCliente';

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="text-zinc-900 p-10">Carregando...</div>}>
      <ProdutoCliente produtoId={id} />
    </Suspense>
  );
}
