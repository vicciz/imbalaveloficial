import { notFound, redirect } from 'next/navigation';
import { decodeProductCode, encodeProductId } from '@/src/utils/linkMask';
import { supabase } from '@/supabaseClient';

interface PageProps {
  params: { code: string };
}

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const { data, error } = await supabase
    .from('produto')
    .select('id');

  if (error || !data) {
    return [];
  }

  return (data as { id: number }[])
    .filter((p) => Number.isFinite(p.id))
    .map((p) => ({ code: encodeProductId(p.id) }));
}

export default function Page({ params }: PageProps) {
  const id = decodeProductCode(params.code);
  if (!id) {
    notFound();
  }
  redirect(`/produto/${id}`);
}
