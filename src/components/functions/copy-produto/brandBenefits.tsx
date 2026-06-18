"use client";

import React from 'react';

interface Props {
  imagemDetalheUrl: string | null;
  produtoNome: string;
  comprar: (id: number) => void;
  produtoId: number;
}

export default function BrandBenefits({ imagemDetalheUrl, produtoNome, comprar, produtoId }: Props) {
  return (
    <section className="py-14 bg-white/70 border-y border-[#c9d9f2] animate-fadeUp">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div className="bg-white rounded-2xl p-6 border border-[#dbe6f7] shadow-lg">
          {imagemDetalheUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagemDetalheUrl} alt={produtoNome} className="w-full h-60 object-contain rounded-xl bg-white" />
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
            <button onClick={() => comprar(produtoId)} className="w-full sm:w-auto px-10 py-4 text-lg font-semibold bg-[#2f61b9] text-white rounded-full shadow-lg shadow-blue-600/30 hover:bg-[#244e96] hover:shadow-blue-700/40 transition animate-pulseGlowBlue">
              Comprar via Checkout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
