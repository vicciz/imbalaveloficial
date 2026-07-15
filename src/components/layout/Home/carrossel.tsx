"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Produto } from "@/src/services/produto/produtos";

type Props = {
  titulo: string;
  produtos?: Produto[];
};

export default function CarrosselProdutos({
  titulo,
  produtos = [],
}: Props) {
  return (
    <section className="mb-12">
      <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        {titulo}
      </h2>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        loop={produtos.length > 4}
        spaceBetween={24}
        breakpoints={{
          0: {
            slidesPerView: 1.2,
          },
          640: {
            slidesPerView: 2,
          },
          900: {
            slidesPerView: 3,
          },
          1200: {
            slidesPerView: 4,
          },
        }}
      >
        {produtos.map((produto) => (
          <SwiperSlide key={produto.id}>
            <Link
              href={`/produto/${produto.id}`}
              className="group block h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-2xl"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4">
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-amber-600 shadow-sm">
                  ⭐ {produto.rating ?? 5}
                </div>

                <img
                  src={produto.image || "/placeholder.png"}
                  alt={produto.nome}
                  className="mx-auto h-64 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex min-h-52 flex-col p-5">
                <h2 className="line-clamp-2 text-xl font-semibold leading-tight text-slate-900">
                  {produto.nome}
                </h2>

                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                  {produto.descricao}
                </p>

                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold tracking-tight text-indigo-700">
                      {Number(produto.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>

                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition-colors group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-700">
                      Ver detalhes
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Em ate 12x no cartao
                  </p>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}