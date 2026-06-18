"use client";

import React from 'react';

export default function Faq() {
  const items = [
    { q: 'Os produtos são originais?', a: 'Sim. Trabalhamos apenas com fornecedores certificados.' },
    { q: 'Qual o prazo de entrega?', a: 'Capitais: até 48h. Demais regiões: 3 a 7 dias úteis.' },
    { q: 'Posso trocar se não gostar?', a: 'Sim, seguimos o prazo legal de arrependimento.' },
  ];

  return (
    <section className="py-14 animate-fadeUp">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-semibold text-center">Perguntas frequentes</h2>
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <details key={item.q} className="bg-white rounded-2xl p-5 border border-[#dbe6f7] shadow-lg cursor-pointer">
              <summary className="font-semibold text-[#1f2f4a]">{item.q}</summary>
              <p className="text-[#56719a] mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
