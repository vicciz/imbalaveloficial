"use client";

import React from 'react';

export default function QuemComprou() {
  const exemplos = [
    'Chegou rápido e a fragrância é marcante. Recomendo!',
    'Fixação excelente, recebi vários elogios.',
    'Produto original e muito bem embalado.',
  ];

  return (
    <section className="py-14 animate-fadeUp">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-semibold text-center">Quem comprou diz</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {exemplos.map((texto, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#dbe6f7] p-6 shadow-lg">
              <p className="text-[#56719a]">“{texto}”</p>
              <p className="mt-4 text-xs text-[#6b84ab]">Compra verificada</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
