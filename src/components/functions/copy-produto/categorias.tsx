"use client";

import React from 'react';

export default function Categorias() {
  return (
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
  );
}
