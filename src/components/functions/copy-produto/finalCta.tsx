"use client";

import React from 'react';

interface Props {
  produtoId: number;
  comprar: (id: number) => void;
}

export default function FinalCta({ produtoId, comprar }: Props) {
  return (
    <section className="py-14 bg-[#a9c3e6] animate-fadeUp">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-semibold">Escolha sua próxima assinatura</h2>
        <p className="text-[#3f5b86] mt-3">Finalize agora e receba em casa com total segurança.</p>
        <div className="mt-6 flex justify-center">
          <button onClick={() => comprar(produtoId)} className="w-full sm:w-auto px-10 py-4 text-lg font-semibold bg-[#2f61b9] text-white rounded-full shadow-lg shadow-blue-600/30 hover:bg-[#244e96] hover:shadow-blue-700/40 transition animate-pulseGlowBlue">
            Comprar via Checkout
          </button>
        </div>
      </div>
    </section>
  );
}
