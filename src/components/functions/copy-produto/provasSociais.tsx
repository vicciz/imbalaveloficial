import React from 'react'

export default function ProvasSociais(){
  return (
    // SOCIAL PROOF (LOGOS)
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
  )
}
