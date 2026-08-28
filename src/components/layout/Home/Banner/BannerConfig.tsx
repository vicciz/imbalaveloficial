"use client";

import { useEffect, useState } from "react";

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
        banner_duracao: duracao,
        banner_transicao:
          transicao as any,
        banner_autoplay:
          autoplay,
        banner_loop:
          loop,
      });

    if (error) {
      console.error(error);
      alert("Erro ao salvar.");
      return;
    }

    alert("Configuração salva.");
  }

  if (loading) return null;

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <h2 className="text-xl font-semibold">
        Configuração do Carrossel
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-6">

        <div>

          <label className="mb-2 block text-sm font-medium">
            Tempo (segundos)
          </label>

          <input
            type="number"
            min={1}
            value={duracao}
            onChange={(e) =>
              setDuracao(
                Number(e.target.value)
              )
            }
            className="w-full rounded-xl border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium">
            Transição
          </label>

          <select
            value={transicao}
            onChange={(e) =>
              setTransicao(
                e.target.value
              )
            }
            className="w-full rounded-xl border p-3"
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

      </div>

      <div className="mt-6 flex gap-8">

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) =>
              setAutoplay(
                e.target.checked
              )
            }
          />

          Reprodução automática

        </label>

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            checked={loop}
            onChange={(e) =>
              setLoop(
                e.target.checked
              )
            }
          />

          Loop infinito

        </label>

      </div>

      <button
        onClick={salvar}
        className="
          mt-8
          rounded-xl
          bg-violet-600
          px-6
          py-3
          text-white
          hover:bg-violet-700
        "
      >
        Salvar configuração
      </button>

    </div>
  );
}