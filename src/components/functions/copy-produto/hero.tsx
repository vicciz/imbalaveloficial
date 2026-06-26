"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Produto } from "@/src/services/produtos";
import { Usuario } from "@/src/services/usuarios";
import { supabase } from "@/supabaseClient";
import logoImbalavel from "@/src/public/assets/imagens/logo.png";
import { AddCart } from "./addCart";
import QuantidadeSelector from "./qtdSelect";

type HeroProps = {
  produto: Produto;
  usuario: Usuario | null;
  imagemAtiva: string | null;
  setImagemAtiva: (url: string) => void;
  setModalOpen: (open: boolean) => void;
  comprar: (id: number) => void;
  maskedLink: string;
};

export default function Hero({
  produto,
  usuario,
  imagemAtiva,
  setImagemAtiva,
  setModalOpen,
  comprar,
  maskedLink,
}: HeroProps) {
  const [quantidade, setQuantidade] = useState(1);

  const imagens =
    produto.produto_imagem?.map((img) =>
      supabase.storage
        .from("produtos")
        .getPublicUrl(img.caminho).data.publicUrl
    ) ?? [];

  useEffect(() => {
    if (imagens.length > 0 && !imagemAtiva) {
      setImagemAtiva(imagens[0]);
    }
  }, [imagens, imagemAtiva, setImagemAtiva]);

  return (
    <section
      id="produto-hero"
      className="max-w-6xl mx-auto px-6 pt-24 pb-14 animate-fadeUp"
    >
      <div className="grid lg:grid-cols-2 gap-12 items-center">

        {/* INFORMAÇÕES */}
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

            <span className="bg-white border border-[#c9d9f2] text-[#2f61b9] px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
              🛡️ Selo de Garantia
            </span>
          </div>

          <QuantidadeSelector
            onChange={(qtd) => setQuantidade(qtd)}
          />

          <div className="mt-6 flex">
            <button
              onClick={() => comprar(produto.id)}
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold bg-[#2f61b9] text-white rounded-full shadow-lg hover:bg-[#244e96] transition"
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

          {/* Imagem Principal */}
          <div className="overflow-hidden rounded-2xl">
            {imagemAtiva && (
              <img
                src={imagemAtiva}
                alt={produto.nome}
                className="w-full h-[520px] object-cover cursor-zoom-in"
                onClick={() => setModalOpen(true)}
              />
            )}
          </div>

          {/* Miniaturas */}
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            {imagens.map((url, i) => (
              <button
                key={i}
                onClick={() => setImagemAtiva(url)}
                className={`w-16 h-16 rounded-xl overflow-hidden border transition ${
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
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}