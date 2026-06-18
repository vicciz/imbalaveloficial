'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/supabaseClient';

interface ProdutoResumo {
  id: number;
  nome: string;
  image: string | null;
}

export default function ColecaoClient() {
  const { id } = useParams<{ id: string }>();
  const [nome, setNome] = useState('');
  const [produtos, setProdutos] = useState<ProdutoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function carregar() {
      setCarregando(true);

      const { data: colecao, error: colecaoError } = await supabase
        .from('colecao')
        .select('id,nome')
        .eq('id', id)
        .single();

      if (colecaoError) {
        console.error('Erro ao carregar coleção:', colecaoError);
        setCarregando(false);
        return;
      }

      const { data: relacoes, error: relacoesError } = await supabase
        .from('colecao_produto')
        .select('produto_id')
        .eq('colecao_id', id);

      if (relacoesError) {
        console.error('Erro ao carregar relação:', relacoesError);
        setCarregando(false);
        return;
      }

      const produtoIds = (relacoes || []).map((r: any) => r.produto_id);

      if (!produtoIds.length) {
        setNome(colecao?.nome || '');
        setProdutos([]);
        setCarregando(false);
        return;
      }

      const { data: produtosData, error: produtosError } = await supabase
        .from('produto')
        .select('id,nome,image')
        .in('id', produtoIds);

      if (produtosError) {
        console.error('Erro ao carregar produtos:', produtosError);
        setCarregando(false);
        return;
      }

      setNome(colecao?.nome || '');
      setProdutos((produtosData as ProdutoResumo[]) || []);
      setCarregando(false);
    }

    carregar();
  }, [id]);

  const hasProdutos = useMemo(() => produtos.length > 0, [produtos]);

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{nome || 'Coleção'}</h1>
          <Link href="/" className="text-indigo-600">Voltar</Link>
        </div>

        {carregando ? (
          <p>Carregando...</p>
        ) : !hasProdutos ? (
          <p className="text-zinc-600">Nenhum produto nesta coleção.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {produtos.map((p) => {
              const imageUrl = p.image
                ? supabase.storage.from('produtos').getPublicUrl(p.image).data.publicUrl
                : '/placeholder.png';

              return (
                <Link
                  key={p.id}
                  href={`/produto/${p.id}`}
                  className="bg-white border border-slate-200 rounded-2xl shadow-lg p-4 text-slate-900 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="w-full aspect-square overflow-hidden rounded-xl mb-3">
                    <img
                      src={imageUrl}
                      alt={p.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-semibold text-sm mb-1 line-clamp-2">{p.nome}</h4>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
