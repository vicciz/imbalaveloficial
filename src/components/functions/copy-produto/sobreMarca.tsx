"use client";

import React from 'react';
import Image, { type StaticImageData } from 'next/image';

interface Props {
  produtoLink?: string | null;
  logo: StaticImageData | string;
}

export default function SobreMarca({ produtoLink, logo }: Props) {
  return (
    <section className="py-14 bg-white/70 border-y border-[#c9d9f2] animate-fadeUp">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-semibold">Sobre a marca</h2>
          <p className="mt-3 text-[#56719a]">
            A IMBALÁVEL nasceu para homens que exigem presença, estilo e autenticidade. Cada produto é selecionado por
            especialistas em fragrâncias.
          </p>
          <a
            href={produtoLink || '#'}
            target="_blank"
            className="inline-block mt-6 bg-white text-[#23446d] px-6 py-3 rounded-full font-semibold shadow-md shadow-blue-900/10 hover:bg-[#f3f7ff] transition"
          >
            Conhecer coleção
          </a>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#dbe6f7] shadow-lg">
          <Image
            src={logo}
            alt="Logo Imbalável"
            className="w-full h-full object-contain rounded-xl bg-white"
          />
        </div>
      </div>
    </section>
  );
}
