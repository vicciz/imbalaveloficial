"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Produto } from "@/src/services/produtos";

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
      <h2 className="text-2xl font-bold mb-5">
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
              className="group block h-full overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="overflow-hidden">
                <img
                  src={produto.image || "/placeholder.png"}
                  alt={produto.nome}
                  className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex h-64 flex-col p-4">
                <h2 className="line-clamp-2 text-lg font-semibold">
                  {produto.nome}
                </h2>

                <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                  {produto.descricao}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    {Number(produto.preco).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>

                  <span className="text-yellow-500">
                    ⭐ {produto.rating ?? 5}
                  </span>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}