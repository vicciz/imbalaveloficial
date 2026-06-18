'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Produto, listarProdutos } from '../../../services/produtos';
import { supabase } from '../../../../supabaseClient';


export default function CarrosselCosmeticos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // fetch products from Supabase instead of PHP API
  useEffect(() => {
    async function load(categoria?: string, tipo?: string) {
      const { data: destaques, error: destaquesError } = await supabase
        .from('produto')
        .select('*')
        .eq('destaque', true);

      if (destaquesError) {
        const msg = destaquesError.message?.toLowerCase() || '';
        if (msg.includes('destaque') || msg.includes('column')) {
          const { data, error } = await listarProdutos(categoria, tipo);
          if (error) {
            console.error('Erro ao listar produtos:', error);
            setProdutos([]);
            return;
          }
          setProdutos(data || []);
          return;
        }

        console.error('Erro ao listar produtos em destaque:', destaquesError);
        setProdutos([]);
        return;
      }

      setProdutos(destaques || []);
    }

    load();
  }, []);

  const produtosVisiveis = mostrarTodos ? produtos : produtos.slice(0, 3);

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto">
      {/* Desktop / Tablet */}
      <div className="hidden md:flex flex-wrap justify-center gap-6">
        {produtosVisiveis.length > 0 ? (
          produtosVisiveis.map((p) => {
            const imageUrl = p.image
              ? supabase.storage.from('produtos').getPublicUrl(p.image).data.publicUrl
              : '/placeholder.png';

            return (
              <Link
                key={p.id}
                href={`/produto/${p.id}`}
                className="w-[260px] bg-white border border-slate-200
                           rounded-2xl shadow-lg p-4 text-slate-900
                           hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-full mb-3">
                  <div className="overflow-hidden rounded-xl bg-slate-50" style={{ paddingBottom: '100%', position: 'relative' }}>
                    <img
                      src={imageUrl}
                      alt={p.nome}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{p.nome}</h3>
                
              </Link>
            );
          })
        ) : (
          <p className="text-center text-zinc-400 col-span-full">
            Nenhum produto encontrado.
          </p>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden flex gap-4 overflow-x-auto no-scrollbar py-4 justify-center">
        {produtosVisiveis.length > 0 ? (
          produtosVisiveis.map((p) => {
            const imageUrl = p.image
              ? supabase.storage.from('produtos').getPublicUrl(p.image).data.publicUrl
              : '/placeholder.png';

            return (
              <Link
                key={p.id}
                href={`/produto/${p.id}`}
                className="min-w-[260px] bg-white border border-slate-200
                           rounded-2xl shadow-lg p-4 text-slate-900"
              >
                <div className="w-full mb-3">
                  <div className="overflow-hidden rounded-xl bg-slate-50" style={{ paddingBottom: '100%', position: 'relative' }}>
                    <img
                      src={imageUrl}
                      alt={p.nome}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{p.nome}</h3>
                
              </Link>
            );
          })
        ) : (
          <p className="text-center text-zinc-400 w-full">Nenhum produto encontrado.</p>
        )}
      </div>

      {produtos.length > 3 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setMostrarTodos(!mostrarTodos)}
            className="px-6 py-2 rounded-full bg-[#2f61b9] text-white font-semibold shadow-lg shadow-blue-600/30 hover:bg-[#244e96] transition"
          >
            {mostrarTodos ? 'Ver menos' : 'Ver mais'}
          </button>
        </div>
      )}
    </div>
  );
}
