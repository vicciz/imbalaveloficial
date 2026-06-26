"use client";

import { useEffect, useState } from 'react';
import Footer from '@/src/components/functions/page-inicio/Footer';
import { Produto, buscarProduto } from '@/src/services/produtos';
import { supabase } from '@/supabaseClient';
import logoImbalavel from '@/src/public/assets/imagens/logo.png';
import Hero from '@/src/components/functions/copy-produto/hero';
import ProvasSociais from '@/src/components/functions/copy-produto/provasSociais';
import Outros from '@/src/components/functions/copy-produto/outros';
import Descricao from '@/src/components/functions/copy-produto/descrição';
import Categorias from '@/src/components/functions/copy-produto/categorias';
import BrandBenefits from '@/src/components/functions/copy-produto/brandBenefits';
import QuemComprou from '@/src/components/functions/copy-produto/quemComprou';
import SobreMarca from '@/src/components/functions/copy-produto/sobreMarca';
import Faq from '@/src/components/functions/copy-produto/faq';
import FinalCta from '@/src/components/functions/copy-produto/finalCta';

function publicUrl(path?: string | null, bucket = 'produtos') {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  try {
    return supabase!.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  } catch {
    return path;
  }
}

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

interface ProdutoDetalheProps {
  produtoId?: string | null;
}

export default function ProdutoDetalhe({ produtoId }: ProdutoDetalheProps) {
  const id = produtoId;
  const [produto, setProduto] = useState<Produto | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [imagemAtiva, setImagemAtiva] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
  async function carregarUsuario() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUsuario(user);
  }

  carregarUsuario();
}, []);
  useEffect(() => {
    if (!id) return;

    buscarProduto(Number(id))
      .then(({ data, error }) => {
        if (error) {
          console.error(error.message ?? error);
          setFetchError(error.message ?? String(error));
          return;
        }
        if (!data) {
          setFetchError('Produto não encontrado');
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
            const url = publicUrl(first, 'produtos');
            setImagemAtiva(url);
          }
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!produto) {
    if (fetchError) {
      return (
        <div className="min-h-screen bg-[#e3eef9] text-[#1f2f4a] flex items-center justify-center">
          <div className="max-w-xl mx-auto p-8 bg-white/90 border border-[#c9d9f2] rounded-3xl shadow-xl text-center">
            <h1 className="text-2xl font-semibold mb-4">Erro ao carregar o produto</h1>
            <p className="text-base mb-6">{fetchError}</p>
            <a href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#1f2f4a] text-white hover:bg-[#16243a] transition">
              Voltar para a loja
            </a>
          </div>
        </div>
      );
    }

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
    <Hero
      produto={produto}
      usuario={usuario}
      imagemAtiva={imagemAtiva}
      setImagemAtiva={setImagemAtiva}
      setModalOpen={setModalOpen}
      comprar={comprar}
      maskedLink={maskedLink}
    />
    <ProvasSociais/>
    <Outros/>
    <Categorias />
    <Descricao detalhesRender={detalhesRender} />
    <BrandBenefits imagemDetalheUrl={null} produtoNome={produto.nome} comprar={comprar} produtoId={produto.id} />
    <QuemComprou />
    <SobreMarca produtoLink={produto.link} logo={logoImbalavel} />
    <Faq />
    <FinalCta produtoId={produto.id} comprar={comprar} />
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
            alt={produto!.nome}
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
