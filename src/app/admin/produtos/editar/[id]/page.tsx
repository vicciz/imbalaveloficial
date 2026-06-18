import React, { Suspense } from 'react';
import EditarProdutoClient from '../EditarProdutoClient';
import { supabase } from '@/supabaseClient';

interface PageProps {
  params: { id: string };
}

export default function EditarProdutoPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="text-zinc-900 p-10">Carregando...</div>}>
      <EditarProdutoClient id={params.id} />
    </Suspense>
  );
}

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const { data, error } = await supabase.from('produto').select('id');
    if (error || !data) return [];
    return data.map((p) => ({ id: String(p.id) }));
  } catch {
    return [];
  }
}
