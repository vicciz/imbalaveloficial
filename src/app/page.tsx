'use client';

import { useEffect, useState } from 'react';
import Footer from '@/src/components/functions/page-inicio/Footer';
import { listarProdutos, type Produto as ServiceProduto } from '@/src/services/produtos';
import CarrosselProdutos from '../components/functions/page-inicio/carrossel';
import { supabase } from '@/supabaseClient';

interface ProdutoImagem {
  caminho: string;
  principal: boolean;
  ordem: number;
}

interface ProdutoResumo {
  id: number;
  nome: string;
  produto_imagem: ProdutoImagem[];
}

interface ColecaoHome {
  id: number;
  nome: string;
  produtos: ProdutoResumo[];
}

export default function Page() {
  const [produtos, setProdutos] = useState<ServiceProduto[]>([]);
  const [colecoesHome, setColecoesHome] = useState<ColecaoHome[]>([]);
  const [curtidas, setCurtidas] = useState<Set<number>>(new Set());
  const [descurtidas, setDescurtidas] = useState<Set<number>>(new Set());

//carregar produtos
  useEffect(() => {
    async function carregar() {
      const { data, error } = await listarProdutos();
      if (error) {
        console.error('Erro ao carregar produtos:', error);
        setProdutos([]);
        return;
      }

      setProdutos(data ?? []);
    }
    carregar();
  }, []);

 
  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 relative">
      {/* Fundo Mesh Gradient Animado */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 opacity-15 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-pink-600 opacity-15 blur-3xl rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-600 opacity-12 blur-3xl rounded-full animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600 opacity-10 blur-3xl rounded-full animate-pulse animation-delay-3000"></div>
      </div>
{/** */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
        .animate-pulse { animation: pulse-slow 8s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-3000 { animation-delay: 3s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      {/* HERO */}

      {colecoesHome.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Coleções em destaque</h2>
            <p className="text-zinc-600 mt-4">Seleções especiais definidas pela curadoria</p>
          </div>

          <div className="space-y-10">
            {colecoesHome.map((colecao) => (
              <div key={colecao.id} className="bg-white/80 border border-black/5 backdrop-blur rounded-2xl p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                  <h3 className="text-2xl font-semibold">{colecao.nome}</h3>
                  <a
                    href={`/colecao/${colecao.id}`}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Ver coleção completa
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {colecao.produtos.map((p) => {
                    const principal =
                      p.produto_imagem?.find(img => img.principal) ??
                      p.produto_imagem?.[0];

                    
                    return (
                      <div
                        key={p.id}
                        className="bg-white border border-slate-200 rounded-2xl shadow-lg p-4 text-slate-900 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col"
                      >
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DESTAQUES */}
      <section
        id="destaques"
        className="max-w-7xl mx-auto px-6 pb-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Destaques IMBALÁVEL
          </h2>

          <p className="text-zinc-600 mt-4">
            Perfumes masculinos mais buscados e bem avaliados
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full">
            <CarrosselProdutos
              titulo="Todos os produtos"
              produtos={produtos}
            />
          </div>
        </div>
        
      </section>

      {/* BENEFÍCIOS */}
      <section className="bg-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            { title: 'Entrega Rápida', desc: 'Envios para todo o Brasil' },
            { title: 'Pagamento Seguro', desc: 'Pix, cartão e boleto' },
            { title: 'Curadoria Premium', desc: 'Perfumes masculinos selecionados' },
          ].map((b, i) => (
            <div key={i}>
              <h4 className="text-xl font-semibold mb-2">{b.title}</h4>
              <p className="text-zinc-600">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
