"use client";

import { useEffect, useState } from "react";

import { Switch } from "@/src/components/ui/switch";

import {
  obterConfigBanner,
  atualizarConfigBanner,
} from "@/src/services/home";

export default function BannerConfig() {
  const [loading, setLoading] =
    useState(true);

  const [duracao, setDuracao] =
    useState(5);

  const [transicao, setTransicao] =
    useState("fade");

  const [autoplay, setAutoplay] =
    useState(true);

  const [loop, setLoop] =
    useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const {
      data,
      error,
    } = await obterConfigBanner();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (data) {
      setDuracao(
        data.banner_duracao
      );

      setTransicao(
        data.banner_transicao
      );

      setAutoplay(
        data.banner_autoplay
      );

      setLoop(
        data.banner_loop
      );
    }

    setLoading(false);
  }

  async function salvar() {
    const { error } =
      await atualizarConfigBanner({
        banner_duracao:
          duracao,
        banner_transicao:
          transicao,
        banner_autoplay:
          autoplay,
        banner_loop:
          loop,
      });

    if (error) {
      console.error(error);
      return;
    }
  }

  if (loading) {
    return (
      <div className="h-[170px] animate-pulse rounded-2xl bg-white" />
    );
  }

  return (
    <div
      className="
        flex
        h-full
        flex-col
        justify-between
        rounded-2xl
        bg-white
        p-6
        shadow-sm
      "
    >
      <div className="space-y-5">

        <div className="flex items-center justify-between">

          <span className="text-sm">

            Duração entre os banners

          </span>

          <input
            type="number"
            min={1}
            value={duracao}
            onChange={(e) =>
              setDuracao(
                Number(
                  e.target.value
                )
              )
            }
            className="
              h-9
              w-16
              rounded-lg
              border
              text-center
            "
          />

        </div>

        <div className="flex items-center justify-between">

          <span className="text-sm">

            Fade

          </span>

          <select
            value={transicao}
            onChange={(e) =>
              setTransicao(
                e.target.value
              )
            }
            className="
              h-9
              w-24
              rounded-lg
              border
              px-2
            "
          >
            <option value="fade">
              Fade
            </option>

            <option value="slide">
              Slide
            </option>

            <option value="zoom">
              Zoom
            </option>

            <option value="none">
              Nenhuma
            </option>

          </select>

        </div>

        <div className="flex items-center justify-between">

          <span className="text-sm">

            Reprodução Automática

          </span>

          <Switch
            checked={autoplay}
            onCheckedChange={
              setAutoplay
            }
          />

        </div>

        <div className="flex items-center justify-between">

          <span className="text-sm">

            Loop

          </span>

          <Switch
            checked={loop}
            onCheckedChange={
              setLoop
            }
          />

        </div>

      </div>

      <button
        onClick={salvar}
        className="
          mt-6
          rounded-xl
          bg-violet-600
          py-3
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-violet-700
        "
      >
        Salvar Configuração
      </button>

    </div>
  );
}