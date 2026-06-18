import React, { Suspense } from 'react';
import ProdutoCliente from './ProdutoCliente';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-zinc-900 p-10">Carregando...</div>}>
      <ProdutoCliente />
    </Suspense>
  );
}
