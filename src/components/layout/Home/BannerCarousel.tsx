"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const banners = [
  {
    id: 1,
    title: "Novidades imperdíveis",
    subtitle: "Descubra fragrâncias selecionadas para cada momento.",
    cta: "Ver coleção",
    href: "/colecao/1",
    image: "/_next/static/media/placeholder?" 
  },
  {
    id: 2,
    title: "Entrega rápida em todo o Brasil",
    subtitle: "Receba seus perfumes com praticidade e segurança.",
    cta: "Comprar agora",
    href: "/#destaques",
    image: "/_next/static/media/placeholder?"
  },
  {
    id: 3,
    title: "Curadoria premium",
    subtitle: "Produtos escolhidos para oferecer sofisticação e destaque.",
    cta: "Explorar produtos",
    href: "/#destaques",
    image: "/_next/static/media/placeholder?"
  },
];

export default function BannerCarousel() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        spaceBetween={24}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="banner-carousel"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative overflow-hidden rounded-[28px] border border-white/50 bg-slate-900 shadow-2xl min-h-[300px] sm:min-h-[360px] lg:min-h-[450px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_35%),linear-gradient(90deg,rgba(17,24,39,0.92),rgba(17,24,39,0.55))]" />
              <img
                src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80"
                alt={banner.title}
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="relative z-10 flex h-full flex-col justify-end gap-4 p-6 sm:p-8 lg:p-12">
                <div className="max-w-xl space-y-4">
                  <span className="inline-flex w-fit rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                    Destaque da semana
                  </span>
                  <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                    {banner.title}
                  </h2>
                  <p className="max-w-lg text-sm text-slate-200 sm:text-base">
                    {banner.subtitle}
                  </p>
                </div>

                <Link
                  href={banner.href}
                  className="inline-flex w-fit items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:scale-[1.02]"
                >
                  {banner.cta}
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}