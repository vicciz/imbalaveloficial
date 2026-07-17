'use client';

import { useEffect, useState } from 'react';
import Footer from '@/src/components/layout/Home/Footer';
import { listarProdutos, type Produto as ServiceProduto } from '@/src/services/produto/produtos';
import CarrosselProdutos from '@/src/components/layout/Home/carrossel';
import BannerCarousel from '@/src/components/layout/Home/BannerCarousel';

const vantagens = [
  {
    titulo: 'Frete gratis acima de R$199',
    descricao: 'Entrega rapida com rastreio para todo o Brasil.',
    badge: '24h',
  },
  {
    titulo: 'Compre no Pix e ganhe cashback',
    descricao: 'Aproveite beneficios exclusivos no pagamento instantaneo.',
    badge: 'Pix',
  },
  {
    titulo: 'Compra protegida ate a entrega',
    descricao: 'Suporte completo da equipe Imbalavel em todo o pedido.',
    badge: 'Safe',
  },
  {
    titulo: 'Parcelamento em ate 12x',
    descricao: 'No cartao com aprovacao rapida e sem burocracia.',
    badge: '12x',
  },
];

const categorias = [
  'Lacrado importado',
  'Assinatura premium',
  'Para presente',
  'Mais vendidos',
  'Lancamentos',
  'Kit com desconto',
  'Fixacao intensa',
  'Ocasiões especiais',
];

const campanhas = [
  {
    titulo: 'Semana dos classicos',
    descricao: 'Ate 40% OFF em fragrancias masculinas selecionadas.',
    acao: 'Aproveitar agora',
    destaque: 'Oferta relampago',
  },
  {
    titulo: 'Selecao para presente',
    descricao: 'Combos prontos para impressionar em qualquer data.',
    acao: 'Ver kits',
    destaque: 'Curadoria',
  },
];

export default function Page() {
  const [produtos, setProdutos] = useState<ServiceProduto[]>([]);

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
    <main className="min-h-screen bg-[#ebebeb] text-zinc-900">
      <BannerCarousel />

      <section className="relative -mt-10 md:-mt-12 z-10 px-4 sm:px-6 pb-7">
        <div className="max-w-7xl mx-auto rounded-2xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-black/5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-black/5">
            {vantagens.map((item) => (
              <div key={item.titulo} className="p-5 md:p-6 flex items-start gap-4">
                <div className="h-11 w-11 rounded-full bg-[#ffe600] text-[#202020] text-sm font-extrabold flex items-center justify-center shadow-sm">
                  {item.badge}
                </div>

                <div>
                  <h2 className="font-semibold text-sm md:text-base leading-tight text-[#202020]">{item.titulo}</h2>
                  <p className="text-xs md:text-sm text-[#737373] mt-1 leading-relaxed">{item.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-[#fff159] via-[#ffe600] to-[#ffd100] p-[1px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div className="rounded-2xl bg-white px-4 py-4 md:px-6 md:py-5">
              <p className="text-xs uppercase tracking-wide text-[#666] mb-3">Explore por estilo</p>

              <div className="flex gap-3 overflow-x-auto pb-1">
                {categorias.map((categoria) => (
                  <button
                    key={categoria}
                    type="button"
                    className="shrink-0 px-4 py-2 rounded-full border border-[#d9d9d9] bg-[#fafafa] text-sm font-medium text-[#333] hover:bg-[#fff9cc] hover:border-[#ffe600] transition"
                  >
                    {categoria}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
          <article className="lg:col-span-7 rounded-2xl bg-[#fff159] p-6 md:p-8 text-[#202020] shadow-[0_10px_24px_rgba(0,0,0,0.1)]">
            <p className="text-xs md:text-sm uppercase tracking-wide font-semibold">Marca oficial Imbalavel</p>
            <h2 className="mt-2 text-2xl md:text-4xl font-extrabold leading-tight">
              Perfumes de impacto com
              <span className="block">preco de campanha toda semana</span>
            </h2>
            <p className="mt-4 text-sm md:text-base text-[#3d3d3d] max-w-xl">
              Curadoria masculina com selo de originalidade, envio agil e condicoes especiais para recompra.
            </p>
            <button
              type="button"
              className="mt-6 rounded-lg bg-[#3483fa] px-6 py-3 text-white font-semibold text-sm md:text-base hover:bg-[#2968c8] transition"
            >
              Ver ofertas do dia
            </button>
          </article>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {campanhas.map((campanha) => (
              <article
                key={campanha.titulo}
                className="rounded-2xl bg-white p-5 border border-black/5 shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
              >
                <p className="text-[11px] uppercase tracking-wide text-[#3483fa] font-bold">{campanha.destaque}</p>
                <h3 className="mt-2 text-lg font-bold text-[#202020]">{campanha.titulo}</h3>
                <p className="mt-2 text-sm text-[#666] leading-relaxed">{campanha.descricao}</p>
                <button
                  type="button"
                  className="mt-4 text-sm font-semibold text-[#3483fa] hover:underline"
                >
                  {campanha.acao}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="destaques"
        className="max-w-7xl mx-auto px-4 sm:px-6 pb-14"
      >
        <div className="rounded-3xl bg-white border border-black/5 shadow-[0_12px_28px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="px-5 pt-7 pb-4 md:px-8 md:pt-9 md:pb-5 border-b border-black/5">
            <p className="text-xs uppercase tracking-wide text-[#737373]">Vitrine principal</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#202020] mt-1">Destaques Imbalavel</h2>
            <p className="text-sm md:text-base text-[#666] mt-2">
              Perfumes mais procurados com reposicao frequente e envio rapido.
            </p>
          </div>

          <div className="px-2 md:px-4 pb-6 md:pb-8">
            <CarrosselProdutos titulo="Todos os produtos" produtos={produtos} />
          </div>
        </div>
      </section>

      <section className="bg-[#f5f8ff] border-y border-[#d9e4fb] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { title: 'Entrega rapida', desc: 'Postagem agil e rastreamento em tempo real.' },
            { title: 'Pagamento seguro', desc: 'Pix, cartao e protecao contra fraudes.' },
            { title: 'Curadoria premium', desc: 'Fragrancias de alta performance e autenticidade.' },
          ].map((b, i) => (
            <div key={i} className="rounded-2xl bg-white p-6 border border-[#e7eefc]">
              <h3 className="text-lg md:text-xl font-semibold text-[#202020]">{b.title}</h3>
              <p className="text-sm md:text-base text-[#5c5c5c] mt-2 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
