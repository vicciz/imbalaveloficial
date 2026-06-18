"use client";

import Image from "next/image";
import { Produto } from "@/src/services/produtos";
import { Usuario } from "@/src/services/usuarios";
import { supabase } from "@/supabaseClient";
import logoImbalavel from "@/src/public/assets/imagens/logo.png";
import { AddCart } from "./addCart";
import QuantidadeSelector from "./qtdSelect";
import { useState } from "react";


type HeroProps = {
  produto: Produto;
  usuario: Usuario | null;
  imagemAtiva: string | null;
  setImagemAtiva: (url: string) => void;
  setModalOpen: (open: boolean) => void;
  comprar: (id: number) => void;
  maskedLink: string;
  imagens: string[];
};

export default function Hero({
  produto,
  usuario,
  imagemAtiva,
  setImagemAtiva,
  setModalOpen,
  comprar,
  maskedLink,
  imagens,
}: HeroProps){

  const [quantidade, setQuantidade] = useState(1);
  return (
    <section
      id="produto-hero"
      className="max-w-6xl mx-auto px-6 pt-24 pb-14 animate-fadeUp"
    >
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* INFO */}
        <div className="bg-white/70 border border-[#c9d9f2] rounded-3xl p-8 shadow-xl">
          <Image
            src={logoImbalavel}
            alt="Logo Imbalável"
            className="h-10 w-auto"
          />

          <span className="text-xs tracking-widest uppercase text-[#4f6b9b]">
            IMBALÁVEL
          </span>

          <h1 className="mt-3 text-4xl md:text-5xl font-semibold">
            {produto.nome}
          </h1>

          <p className="mt-3 text-lg text-[#4b6386]">
            {produto.descricao}
          </p>

          <p className="font-semibold md:text-5xl">
            {Number(produto.preco).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="bg-[#cfe2ff] text-[#1f3a5f] px-3 py-1 rounded-full text-sm font-semibold">
              ⭐ {produto.rating || "5.0"}
            </span>

            <span className="text-sm text-[#56719a]">
              ({produto.reviews || 128} avaliações)
            </span>

            <span className="bg-white border border-[#c9d9f2] text-[#2f61b9] px-3 py-1 rounded-full text-xs font-semibold shadow-sm inline-flex items-center gap-1">
              🛡️ Selo de Garantia
            </span>
          </div>
            <QuantidadeSelector
              onChange={setQuantidade}
            />
          <div className="mt-6 flex">
            <button
              onClick={() => comprar(produto.id)}
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold bg-[#2f61b9] text-white rounded-full shadow-lg shadow-blue-600/30 hover:bg-[#244e96] hover:shadow-blue-700/40 transition animate-pulseGlowBlue"
            >
              Comprar via Checkout
            </button>
            {usuario && (
              <AddCart
                productId={produto.id}
                userId={usuario.id}
                quantidade={quantidade}
                tiitle="Adicionar ao Carrinho"
              />
            )}
          </div>
          

          <p className="mt-4 text-sm text-[#56719a]">
            ⚠️ Estoque limitado
          </p>

          <p className="mt-2 text-xs text-[#6b84ab]">
            Link protegido: {maskedLink}
          </p>
        </div>

        {/* GALERIA */}
        <div className="bg-[#a9c3e6] rounded-3xl p-8 shadow-2xl">
          <div className="overflow-hidden rounded-2xl">
            {imagemAtiva && (
              <img
                src={imagemAtiva}
                alt={produto.nome}
                className="w-full h-[520px] object-cover cursor-zoom-in scale-[1.08] origin-center"
                onClick={() => setModalOpen(true)}
              />
            )}
          </div>

          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            {imagens.map((img, i) => {
              let url = img;

              if (!img.startsWith("http")) {
                if (!supabase) {
                  console.error("Supabase não inicializado");
                  return null;
                }

                url = supabase.storage
                  .from("produto") // altere para "produtos" se esse for o bucket correto
                  .getPublicUrl(img).data.publicUrl;
              }

              return (
                <button
                  key={i}
                  onClick={() => setImagemAtiva(url)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border bg-white/80 hover:scale-105 transition ${
                    imagemAtiva === url
                      ? "border-[#2f61b9] ring-2 ring-[#2f61b9]/20"
                      : "border-[#c9d9f2]"
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
  );
}