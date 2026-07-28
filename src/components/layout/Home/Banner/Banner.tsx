"use client";

import { useEffect, useState } from "react";

import BannerImage from "./BannerImage";
import CardList from "../ListCardProduto/CardList";

import {
  listarBanners,
} from "@/src/services/banner";

import {
  obterConfigBanner,
} from "@/src/services/home";

import type {
  Banner as BannerType,
} from "@/src/services/banner/types";

export default function Banner() {
  const [banners, setBanners] =
    useState<BannerType[]>([]);

  const [bannerAtual, setBannerAtual] =
    useState(0);

  const [animando, setAnimando] =
    useState(false);

  const [fade, setFade] =
    useState(true);

  const [config, setConfig] =
    useState({
      banner_duracao: 5,
      banner_transicao: "fade",
      banner_autoplay: true,
      banner_loop: true,
    });

  useEffect(() => {
    carregar();
  }, []);

useEffect(() => {
  if (
    banners.length <= 1 ||
    !config.banner_autoplay
  ) {
    return;
  }

  const timer = setInterval(() => {
    trocarBanner();
  }, config.banner_duracao * 1000);

  return () => clearInterval(timer);

}, [
  banners.length,
  config.banner_duracao,
  config.banner_autoplay,
]);
  async function carregar() {

    const {
      data,
      error,
    } = await listarBanners();

    if (error) {
      console.error(error);
      return;
    }

    const lista =
      (data ?? [])
        .filter(
          (item) => item.ativo
        )
        .sort(
          (a, b) =>
            a.ordem - b.ordem
        );

    setBanners(lista);

    const {
      data: cfg,
      error: erroConfig,
    } =
      await obterConfigBanner();

    if (erroConfig) {
      console.error(
        erroConfig
      );
      return;
    }

    if (cfg) {
      setConfig({
        banner_duracao:
          cfg.banner_duracao,
        banner_transicao:
          cfg.banner_transicao,
        banner_autoplay:
          cfg.banner_autoplay,
        banner_loop:
          cfg.banner_loop,
      });
    }

  }
    function trocarBanner() {

    if (animando) return;

    setAnimando(true);

    if (
      config.banner_transicao ===
      "fade"
    ) {
      setFade(false);

      setTimeout(() => {

        proximoBanner();

        setFade(true);

        setTimeout(() => {

          setAnimando(false);

        }, 500);

      }, 300);

      return;
    }

    proximoBanner();

    setTimeout(() => {

      setAnimando(false);

    }, 600);

  }

  function proximoBanner() {

    setBannerAtual((atual) => {

      const proximo =
        atual + 1;

      if (
        proximo >=
        banners.length
      ) {

        return config.banner_loop
          ? 0
          : atual;

      }

      return proximo;

    });

  }

  function bannerAnterior() {

    if (animando) return;

    setAnimando(true);

    if (
      config.banner_transicao ===
      "fade"
    ) {

      setFade(false);

      setTimeout(() => {

        setBannerAtual((atual) => {

          if (atual === 0) {

            return config.banner_loop
              ? banners.length - 1
              : 0;

          }

          return atual - 1;

        });

        setFade(true);

        setTimeout(() => {

          setAnimando(false);

        }, 500);

      }, 300);

      return;

    }

    setBannerAtual((atual) => {

      if (atual === 0) {

        return config.banner_loop
          ? banners.length - 1
          : 0;

      }

      return atual - 1;

    });

    setTimeout(() => {

      setAnimando(false);

    }, 600);

  }

  if (
    banners.length === 0
  ) {

    return null;

  }

  const estiloSlide = {
    transform: `translateX(-${
      bannerAtual * 100
    }%)`,
    transition:
      "transform .6s ease-in-out",
  };

    return (

    <section className="w-full">

      <div
          className="
        group
          relative
          h-[500px]
          w-full
          overflow-hidden
        "
      >

        {/* SETA ESQUERDA */}

        <button
          onClick={bannerAnterior}
          className="
  absolute
  left-5
  top-1/2
  z-30
  -translate-y-1/2
  rounded-full
  bg-black/40
  px-4
  py-3
  text-2xl
  text-white
  backdrop-blur
  transition-all
  duration-300
  opacity-0
  group-hover:opacity-100
  hover:bg-black/60
"
        >
          ‹
        </button>

        {/* SETA DIREITA */}

        <button
          onClick={trocarBanner}
          className="
          absolute
          right-5
          top-1/2
          z-30
          -translate-y-1/2
          rounded-full
          bg-black/40
          px-4
          py-3
          text-2xl
          text-white
          backdrop-blur
          transition-all
          duration-300
          opacity-0
          group-hover:opacity-100
          hover:bg-black/60
        "
        >
          ›
        </button>

        {/* SLIDE */}

        {config.banner_transicao ===
        "slide" ? (

          <div
            className="
              flex
              h-full
              w-full
            "
            style={estiloSlide}
          >

            {banners.map(
              (banner) => (

                <div
                  key={banner.id}
                  className="
                    h-full
                    min-w-full
                  "
                >

                  <BannerImage
                    image={
                      banner.imagem
                    }
                  />

                </div>

              )
            )}

          </div>

        ) : (

          <div
            className={`
              absolute
              inset-0
              transition-all
              duration-500

              ${
                config.banner_transicao ===
                "fade"

                  ? fade
                    ? "opacity-100"
                    : "opacity-0"

                  : ""
              }

              ${
                config.banner_transicao ===
                "zoom"

                  ? fade
                    ? "scale-100"
                    : "scale-110"

                  : ""
              }
            `}
          >

            <BannerImage
              image={
                banners[
                  bannerAtual
                ].imagem
              }
            />

          </div>

          )}
              {/* INDICADORES */}

        <div
          className="
            absolute
            bottom-6
            left-1/2
            z-30
            flex
            -translate-x-1/2
            gap-3
          "
        >

          {banners.map(
            (_, index) => (

              <button
                key={index}
                onClick={() =>
                  setBannerAtual(index)
                }
                className={`
                  h-3
                  rounded-full
                  transition-all

                  ${
                    bannerAtual === index
                      ? "w-8 bg-white"
                      : "w-3 bg-white/40"
                  }
                `}
              />

            )
          )}

        </div>

      </div>

      {/* CARDS */}

      <div
        className="
          relative
          z-20
          mx-auto
          -mt-12
          max-w-[1100px]
        "
      >

        <CardList />

      </div>

    </section>

  );

}