"use client";

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { ComprarButton } from '@/src/components/button';
import CarrosselCosmeticos from '@/src/components/Carrossel-Cosmeticos';
import Footer from '@/src/components/Footer';
import { Cronometro } from '@/src/components/cronometro';
import { Produto, buscarProduto } from '@/src/services/produtos';
import { supabase } from '@/supabaseClient';
import logoImbalavel from '@/src/public/assets/imagens/logo.png';

//enviar requisição para o backend criar a compra e redirecionar para checkout
  async function comprar(id: number) {

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao redirecionar para checkout');
      }
    } else {
      alert('Erro ao processar a compra');
    }
  }


export default function ProdutoDetalhe() {

  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [produto, setProduto] = useState<Produto | null>(null);
  const [imagemAtiva, setImagemAtiva] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    buscarProduto(Number(id))
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }
        setProduto(data);
        if (data) {
          const candidateImages = [
            data.image,
            data.image1,
            data.image2,
            data.image3,
            data.image4,
            data.image5,
            data.image6,
            data.imagem_detalhe,
          ].filter(Boolean) as string[];

          const first = candidateImages[0];
          if (first) {
            const url = first.startsWith('http')
              ? first
              : supabase.storage.from('produtos').getPublicUrl(first).data.publicUrl;
            setImagemAtiva(url);
          }
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!produto) {
    return (
      <div className="min-h-screen bg-[#e3eef9] text-[#1f2f4a]">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-14">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white/70 border border-[#c9d9f2] rounded-3xl p-8 shadow-xl space-y-4">
              <div className="h-3 w-24 rounded skeleton" />
              <div className="h-10 w-3/4 rounded skeleton" />
              <div className="h-4 w-full rounded skeleton" />
              <div className="h-4 w-5/6 rounded skeleton" />
              <div className="h-12 w-48 rounded-full skeleton" />
            </div>
            <div className="bg-[#a9c3e6] rounded-3xl p-8 shadow-2xl">
              <div className="h-[360px] rounded-2xl skeleton" />
              <div className="mt-6 flex gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-16 h-16 rounded-xl skeleton" />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const maskedLink = (() => {
    if (!produto.link) return "link protegido";
    try {
      const url = new URL(produto.link);
      return `${url.host}/•••`;
    } catch {
      return produto.link.replace(/^https?:\/\//, "").replace(/\/.*/, "/•••");
    }
  })();

  const imagens = [
    produto.image,
    produto.image1,
    produto.image2,
    produto.image3,
    produto.image4,
    produto.image5,
    produto.image6,
    produto.imagem_detalhe,
  ].filter(Boolean) as string[];

  const detalheFallback = ([
    produto.image1,
    produto.image2,
    produto.image3,
    produto.image4,
    produto.image5,
    produto.image6,
  ].filter(Boolean) as string[])[0];

  const imagemDetalheUrl = produto.imagem_detalhe
    ? (produto.imagem_detalhe.startsWith('http')
        ? produto.imagem_detalhe
        : supabase.storage.from('produtos').getPublicUrl(produto.imagem_detalhe).data.publicUrl)
    : detalheFallback
      ? (detalheFallback.startsWith('http')
          ? detalheFallback
          : supabase.storage.from('produtos').getPublicUrl(detalheFallback).data.publicUrl)
      : null;

  const detalhesRender = (produto.detalhes || produto.descricao || '').replace(
    /<div\s+style="([^"]*)">\s*!\[([^\]]*)\]\(([^)]+)\)\s*<\/div>/gi,
    (_m, styleString: string, alt: string, src: string) => {
      const textAlignMatch = styleString.match(/text-align\s*:\s*(left|center|right)/i);
      const marginBottomMatch = styleString.match(/margin-bottom\s*:\s*([^;]+)/i);
      const align = textAlignMatch?.[1]?.toLowerCase();
      const margin = align === 'center' ? '0 auto' : align === 'left' ? '0 auto 0 0' : align === 'right' ? '0 0 0 auto' : '0 auto';
      const marginBottom = marginBottomMatch?.[1]?.trim();
      return `<img src="${src}" alt="${alt}" style="max-width:100%;display:block;margin:${margin};${marginBottom ? `margin-bottom:${marginBottom};` : ''}" />`;
    }
  )
  // Converte \n para <br> dentro de elementos HTML (divs de texto formatado)
  .replace(
    /(<(?:div|p|span|h[1-6])[^>]*>)((?:[\s\S](?!<\/?(?:div|p|span|h[1-6])))*?)(<\/(?:div|p|span|h[1-6])>)/gi,
    (_, open, inner, close) => open + inner.replace(/\n/g, '<br>\n') + close
  );

  

  return (
    <div className="min-h-screen bg-[#e3eef9] text-[#1f2f4a]">
      {/* HERO */}
      <section id="produto-hero" className="max-w-6xl mx-auto px-6 pt-24 pb-14 animate-fadeUp">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="bg-white/70 border border-[#c9d9f2] rounded-3xl p-8 shadow-xl">
            <Image
              src={logoImbalavel}
              alt="Logo Imbalável"
              className="h-10 w-auto"
            />
            <span className="text-xs tracking-widest uppercase text-[#4f6b9b]">IMBALÁVEL</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold">
              {produto.nome}
            </h1>
            <p className="mt-3 text-lg text-[#4b6386]">
              {produto.descricao}
            </p>
            <p className=''>R$ {produto.preco}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="bg-[#cfe2ff] text-[#1f3a5f] px-3 py-1 rounded-full text-sm font-semibold">
                ⭐ {produto.rating || '5.0'}
              </span>
              <span className="text-sm text-[#56719a]">({produto.reviews || 128} avaliações)</span>
              <span className="bg-white border border-[#c9d9f2] text-[#2f61b9] px-3 py-1 rounded-full text-xs font-semibold shadow-sm inline-flex items-center gap-1">
                🛡️ Selo de Garantia
              </span>
            </div>

            <div className="mt-6 flex">
              <ComprarButton
                productId={produto.id}
                link={produto.link}
                className="w-full sm:w-auto px-10 py-4 text-lg font-semibold bg-[#2f61b9] text-white rounded-full shadow-lg shadow-blue-600/30 hover:bg-[#244e96] hover:shadow-blue-700/40 transition animate-pulseGlowBlue"
              />
            </div>

            <p className="mt-4 text-sm text-[#56719a]">⚠️ Estoque limitado</p>
            <p className="mt-2 text-xs text-[#6b84ab]">Link protegido: {maskedLink}</p>
          </div>

          <div className="bg-[#a9c3e6] rounded-3xl p-8 shadow-2xl">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={imagemAtiva!}
                alt={produto.nome}
                className="w-full h-[520px] object-cover cursor-zoom-in scale-[1.08] origin-center"
                onClick={() => setModalOpen(true)}
              />
            </div>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              {imagens.map((img, i) => {
                const url = img.startsWith('http')
                  ? img
                  : supabase.storage.from('produtos').getPublicUrl(img).data.publicUrl;

                return (
                  <button
                    key={i}
                    onClick={() => setImagemAtiva(url)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border bg-white/80 hover:scale-105 transition ${
                      imagemAtiva === url ? 'border-[#2f61b9] ring-2 ring-[#2f61b9]/20' : 'border-[#c9d9f2]'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${produto.nome} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF (LOGOS) */}
      <section className="py-10 bg-white/70 border-y border-[#c9d9f2] animate-fadeUp">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[#56719a] text-sm mb-6">
            Recomendado por publicações e marcas parceiras
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center text-center text-[#6b84ab] text-sm">
            <div>GQ</div>
            <div>Esquire</div>
            <div>Men’s Health</div>
            <div>Elle</div>
            <div>Forbes</div>
          </div>
        </div>
      </section>

      {/* MAIS VENDIDOS */}
      <section className="py-14 animate-fadeUp">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center">Mais Vendidos</h2>
          <p className="text-center text-[#56719a] mt-2">Top escolhas da curadoria</p>
          <div className="mt-8 flex justify-center">
            <div className="w-full">
              <CarrosselCosmeticos />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="py-14 bg-white/70 border-y border-[#c9d9f2] animate-fadeUp">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center">Categorias</h2>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Perfumes', 'Skincare', 'Outfit', 'Acessórios'].map((c) => (
              <div key={c} className="bg-white rounded-2xl p-6 border border-[#dbe6f7] text-center shadow-lg">
                <div className="text-2xl mb-2">★</div>
                <p className="font-semibold">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESCRIÇÃO */}
      <section className="py-14 animate-fadeUp">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center">Descrição do Produto</h2>
          <div className="mt-8 bg-white rounded-2xl p-8 border border-[#dbe6f7] shadow-lg">
            <div className="text-[#56719a] text-lg leading-relaxed space-y-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  img: ({ src = '', alt = '', style, ...props }) => {
                    const resolved = src.startsWith('http') ? src : supabase.storage.from('produtos').getPublicUrl(src).data.publicUrl;
                    const mergedStyle: React.CSSProperties = {
                      display: 'block',
                      width: '100%',
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '60vh',
                      margin: '0 auto',
                      objectFit: 'contain',
                      ...(style as React.CSSProperties || {}),
                    };

                    return (
                      <img
                        {...props}
                        src={resolved}
                        alt={alt}
                        style={mergedStyle}
                        className="rounded-xl border border-[#dbe6f7] shadow-sm my-4"
                      />
                    );
                  },
                  a: ({ href = '', children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2f61b9] underline break-all"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {detalhesRender}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND BENEFITS */}
      <section className="py-14 bg-white/70 border-y border-[#c9d9f2] animate-fadeUp">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div className="bg-white rounded-2xl p-6 border border-[#dbe6f7] shadow-lg">
            {imagemDetalheUrl ? (
              <img src={imagemDetalheUrl} alt={produto.nome} className="w-full h-60 object-contain rounded-xl bg-white" />
            ) : (
              <div className="w-full h-60 rounded-xl bg-slate-100 border border-[#dbe6f7] flex items-center justify-center text-sm text-[#6b84ab]">
                Sem imagem detalhe
              </div>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-semibold">Por que escolher a IMBALÁVEL</h2>
            <ul className="mt-4 space-y-3 text-[#56719a]">
              <li>✔️ Curadoria com foco em performance real</li>
              <li>✔️ Produtos originais e certificados</li>
              <li>✔️ Atendimento humano e rápido</li>
            </ul>
            <div className="mt-6 flex gap-4">
            <button onClick={() => comprar(produto.id)} className="px-6 py-3 bg-[#2f61b9] text-white font-semibold rounded-full shadow-lg hover:bg-[#244e96] transition">
              Comprar via Checkout
            </button>
              <ComprarButton
                productId={produto.id}
                link={produto.link}
                className="px-6 py-3 rounded-full font-semibold shadow-lg hover:brightness-110 transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* QUEM COMPROU DIZ */}
      <section className="py-14 animate-fadeUp">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center">Quem comprou diz</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              'Chegou rápido e a fragrância é marcante. Recomendo!',
              'Fixação excelente, recebi vários elogios.',
              'Produto original e muito bem embalado.',
            ].map((texto, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#dbe6f7] p-6 shadow-lg">
                <p className="text-[#56719a]">“{texto}”</p>
                <p className="mt-4 text-xs text-[#6b84ab]">Compra verificada</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-14 bg-white/70 border-y border-[#c9d9f2] animate-fadeUp">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            
            <h2 className="text-3xl font-semibold">Sobre a marca</h2>
            <p className="mt-3 text-[#56719a]">
              A IMBALÁVEL nasceu para homens que exigem presença, estilo e autenticidade. Cada produto é selecionado por
              especialistas em fragrâncias.
            </p>
            <a
              href={produto.link}
              target="_blank"
              className="inline-block mt-6 bg-white text-[#23446d] px-6 py-3 rounded-full font-semibold shadow-md shadow-blue-900/10 hover:bg-[#f3f7ff] transition"
            >
              Conhecer coleção
            </a>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#dbe6f7] shadow-lg">
            <Image
              src={logoImbalavel}
              alt="Logo Imbalável"
              className="w-full h-full object-contain rounded-xl bg-white"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 animate-fadeUp">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center">Perguntas frequentes</h2>
          <div className="mt-8 space-y-4">
            {[
              { q: 'Os produtos são originais?', a: 'Sim. Trabalhamos apenas com fornecedores certificados.' },
              { q: 'Qual o prazo de entrega?', a: 'Capitais: até 48h. Demais regiões: 3 a 7 dias úteis.' },
              { q: 'Posso trocar se não gostar?', a: 'Sim, seguimos o prazo legal de arrependimento.' },
            ].map((item) => (
              <details key={item.q} className="bg-white rounded-2xl p-5 border border-[#dbe6f7] shadow-lg cursor-pointer">
                <summary className="font-semibold text-[#1f2f4a]">{item.q}</summary>
                <p className="text-[#56719a] mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-14 bg-[#a9c3e6] animate-fadeUp">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold">Escolha sua próxima assinatura</h2>
          <p className="text-[#3f5b86] mt-3">Finalize agora e receba em casa com total segurança.</p>
          <div className="mt-6 flex justify-center">
            <ComprarButton
              productId={produto.id}
              link={produto.link}
              className="px-12 py-3 rounded-full bg-[#2f61b9] text-white font-semibold shadow-lg shadow-blue-700/30 hover:bg-[#244e96] transition animate-pulseGlowBlue"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />

      {modalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setModalOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white text-2xl"
            aria-label="Fechar"
            onClick={() => setModalOpen(false)}
          >
            ✕
          </button>
          <img
            src={imagemAtiva!}
            alt={produto.nome}
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
