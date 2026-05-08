'use client';

import { useEffect, useState } from 'react';
import Footer from '@/src/components/Footer';
import { listarProdutos, type Produto as ServiceProduto } from '@/src/services/produtos';
import CarrosselCosmeticos from '@/src/components/Carrossel-Cosmeticos';
import { supabase } from '@/supabaseClient';
import { encodeProductId } from '@/src/utils/linkMask';

interface ProdutoResumo {
  id: number;
  nome: string;
  image: string | null;
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

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem('curtidas') || '[]');
    const d = JSON.parse(localStorage.getItem('descurtidas') || '[]');
    setCurtidas(new Set(c));
    setDescurtidas(new Set(d));
  }, []);

  function toggleCurtir(e: React.MouseEvent, id: number) {
    e.preventDefault();
    setCurtidas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setDescurtidas((pd) => { const nd = new Set(pd); nd.delete(id); localStorage.setItem('descurtidas', JSON.stringify([...nd])); return nd; });
      }
      localStorage.setItem('curtidas', JSON.stringify([...next]));
      return next;
    });
  }

  function toggleDescurtir(e: React.MouseEvent, id: number) {
    e.preventDefault();
    setDescurtidas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setCurtidas((pc) => { const nc = new Set(pc); nc.delete(id); localStorage.setItem('curtidas', JSON.stringify([...nc])); return nc; });
      }
      localStorage.setItem('descurtidas', JSON.stringify([...next]));
      return next;
    });
  }


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

  useEffect(() => {
    async function carregarColecoesHome() {
      const { data: colecoes, error: colecoesError } = await supabase
        .from('colecao')
        .select('id,nome,mostrar_home')
        .eq('mostrar_home', true)
        .order('created_at', { ascending: false });

      if (colecoesError) {
        const { data: fallbackColecoes, error: fallbackError } = await supabase
          .from('colecao')
          .select('id,nome')
          .order('created_at', { ascending: false });

        if (fallbackError) {
          console.error('Erro ao carregar coleções da home (fallback):', fallbackError);
          return;
        }

        if (!fallbackColecoes?.length) {
          setColecoesHome([]);
          return;
        }

        const colecaoIds = fallbackColecoes.map((c: any) => c.id);
        const { data: relacoes, error: relacoesError } = await supabase
          .from('colecao_produto')
          .select('colecao_id, produto_id')
          .in('colecao_id', colecaoIds);

        if (relacoesError) {
          console.error('Erro ao carregar relações de coleções:', relacoesError);
          const normalized = fallbackColecoes.map((c: any) => ({
            id: c.id,
            nome: c.nome,
            produtos: [],
          }));
          setColecoesHome(normalized);
          return;
        }

        const produtoIds = Array.from(
          new Set((relacoes || []).map((r: any) => r.produto_id))
        );

        if (!produtoIds.length) {
          setColecoesHome(
            fallbackColecoes.map((c: any) => ({ id: c.id, nome: c.nome, produtos: [] }))
          );
          return;
        }

        const { data: produtosData, error: produtosError } = await supabase
          .from('produtos')
          .select('id,nome,image')
          .in('id', produtoIds);

        if (produtosError) {
          console.error('Erro ao carregar produtos das coleções:', produtosError);
          return;
        }

        const produtosMap = new Map<number, ProdutoResumo>();
        (produtosData || []).forEach((p: any) => {
          produtosMap.set(p.id, { id: p.id, nome: p.nome, image: p.image || null });
        });

        const produtosPorColecao = new Map<number, ProdutoResumo[]>();
        (relacoes || []).forEach((r: any) => {
          const list = produtosPorColecao.get(r.colecao_id) || [];
          const produto = produtosMap.get(r.produto_id);
          if (produto) list.push(produto);
          produtosPorColecao.set(r.colecao_id, list);
        });

        const normalized = fallbackColecoes.map((c: any) => ({
          id: c.id,
          nome: c.nome,
          produtos: (produtosPorColecao.get(c.id) || []).slice(0, 3),
        }));

        setColecoesHome(normalized);
        return;
      }

      if (!colecoes?.length) {
        setColecoesHome([]);
        return;
      }

      const colecaoIds = colecoes.map((c: any) => c.id);
      const { data: relacoes, error: relacoesError } = await supabase
        .from('colecao_produto')
        .select('colecao_id, produto_id')
        .in('colecao_id', colecaoIds);

      if (relacoesError) {
        console.error('Erro ao carregar relações de coleções:', relacoesError);
        return;
      }

      const produtoIds = Array.from(
        new Set((relacoes || []).map((r: any) => r.produto_id))
      );

      if (!produtoIds.length) {
        setColecoesHome(
          colecoes.map((c: any) => ({ id: c.id, nome: c.nome, produtos: [] }))
        );
        return;
      }

      const { data: produtosData, error: produtosError } = await supabase
        .from('produtos')
        .select('id,nome,image')
        .in('id', produtoIds);

      if (produtosError) {
        console.error('Erro ao carregar produtos das coleções:', produtosError);
        return;
      }

      const produtosMap = new Map<number, ProdutoResumo>();
      (produtosData || []).forEach((p: any) => {
        produtosMap.set(p.id, { id: p.id, nome: p.nome, image: p.image || null });
      });

      const produtosPorColecao = new Map<number, ProdutoResumo[]>();
      (relacoes || []).forEach((r: any) => {
        const list = produtosPorColecao.get(r.colecao_id) || [];
        const produto = produtosMap.get(r.produto_id);
        if (produto) list.push(produto);
        produtosPorColecao.set(r.colecao_id, list);
      });

      const normalized = colecoes.map((c: any) => ({
        id: c.id,
        nome: c.nome,
        produtos: (produtosPorColecao.get(c.id) || []).slice(0, 3),
      }));

      setColecoesHome(normalized);
    }

    carregarColecoesHome();
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
      <section className="relative z-10 w-full h-[75vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/80 backdrop-blur-sm" />

        <div className="relative z-10 px-6 max-w-4xl">
          <span className="inline-block mb-6 px-4 py-1 rounded-full border border-black/20 text-sm tracking-widest text-zinc-700">
            IMBALÁVEL
          </span>

          <h1 className="text-5xl md:text-7xl font-bold tracking-wide leading-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-amber-700 bg-clip-text text-transparent">
            Beleza não se explica.<br />Se impõe.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-zinc-600">
            Os melhores perfumes masculinos, cosméticos premium e fragrâncias marcantes disponíveis na web.
          </p>

          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <a
              href="#destaques"
              className="px-8 py-3 rounded-full bg-pink-600 hover:bg-pink-500 text-white transition font-semibold"
            >
              Ver Destaques
            </a>

            <a
              href="#categorias"
              className="px-8 py-3 rounded-full border border-black/20 hover:bg-black/5 transition"
            >
              Explorar Coleção
            </a>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section
        id="categorias"
        className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {[
          { title: 'Perfumes Masculinos', desc: 'Fragrâncias intensas, sofisticadas e marcantes' },
          { title: 'Skincare Premium', desc: 'Cuidado diário para homens exigentes' },
          { title: 'Moda Fitnes', desc: 'Presença, identidade e confiança' },
        ].map((c, i) => (
          <div
            key={i}
            className="bg-white/80 border border-black/5 backdrop-blur rounded-2xl p-10 text-center hover:scale-[1.03] transition"
          >
            <h3 className="text-2xl font-semibold mb-4">{c.title}</h3>
            <p className="text-zinc-600">{c.desc}</p>
          </div>
        ))}
      </section>

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
                    const imageUrl = p.image
                      ? supabase.storage.from('produtos').getPublicUrl(p.image).data.publicUrl
                      : '/placeholder.png';

                    const curtido = curtidas.has(p.id);
                    const descurtido = descurtidas.has(p.id);

                    return (
                      <div
                        key={p.id}
                        className="bg-white border border-slate-200 rounded-2xl shadow-lg p-4 text-slate-900 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col"
                      >
                        <a href={`/p?code=${encodeProductId(p.id)}`}>
                          <div className="w-full aspect-square overflow-hidden rounded-xl mb-3">
                            <img
                              src={imageUrl}
                              alt={p.nome}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h4 className="font-semibold text-sm mb-3 line-clamp-2">{p.nome}</h4>
                        </a>
                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={(e) => toggleCurtir(e, p.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                              curtido
                                ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-pink-50 hover:text-pink-500'
                            }`}
                          >
                            <span className="text-base">{curtido ? '❤️' : '🤍'}</span>
                            Curtir
                          </button>
                          <button
                            onClick={(e) => toggleDescurtir(e, p.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                              descurtido
                                ? 'bg-slate-600 text-white shadow-md shadow-slate-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                            }`}
                          >
                            <span className="text-base">👎</span>
                            Não curtir
                          </button>
                        </div>
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
            <CarrosselCosmeticos />
          </div>
        </div>
        
      </section>

      {/* SEO CONTENT */}
      <section className="max-w-5xl mx-auto px-6 pb-24 text-zinc-700 leading-relaxed">
        <h2 className="text-3xl font-bold text-zinc-900 mb-6">
          Os Melhores Perfumes Masculinos Disponíveis Online
        </h2>

        <p className="mb-6">
          A IMBALÁVEL é uma plataforma especializada em reunir os <strong>melhores perfumes masculinos disponíveis na web</strong>,
          conectando você às fragrâncias mais desejadas, bem avaliadas e com excelente custo-benefício.
        </p>

        <p className="mb-6">
          Nossa curadoria inclui <strong>perfumes masculinos importados</strong>, fragrâncias intensas para a noite,
          aromas frescos para o dia a dia e perfumes com alta fixação e projeção.
          Cada produto é selecionado para homens que buscam presença, elegância e identidade.
        </p>

        <h3 className="text-2xl font-semibold text-zinc-900 mb-4">
          Por que escolher perfumes através da IMBALÁVEL?
        </h3>

        <ul className="list-disc pl-6 space-y-3">
          <li>Seleção dos perfumes masculinos mais vendidos</li>
          <li>Links diretos para compra online segura</li>
          <li>Produtos com avaliações reais e alto rating</li>
          <li>Curadoria focada em performance, estilo e impacto</li>
        </ul>

        <p className="mt-6">
          Se você procura o <strong>melhor perfume masculino para marcar presença</strong>,
          elevar sua confiança e deixar sua assinatura por onde passar, você está no lugar certo.
        </p>
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
