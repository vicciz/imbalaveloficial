"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  X,
  Save,
} from "lucide-react";

import type { Banner } from "@/src/services/banner/types";
import { uploadBanner } from "@/src/services/banner/storage";
import Image from "next/image";

interface BannerModalProps {
  open: boolean;

  banner?: Banner | null;

  onClose: () => void;

  onSave: (
    banner: Partial<Banner>
  ) => Promise<void>;
}

export default function BannerModal({
  open,
  banner,
  onClose,
  onSave,
}: BannerModalProps) {
  const [titulo, setTitulo] =
    useState("");

  const [subtitulo, setSubtitulo] =
    useState("");

  const [imagem, setImagem] =
    useState("");

  const [botao, setBotao] =
    useState("");

  const [link, setLink] =
    useState("");

  const [ordem, setOrdem] =
    useState(1);

  const [ativo, setAtivo] =
    useState(true);
  const [uploading, setUploading] =
  useState(false);

  useEffect(() => {
    if (!banner) {
      setTitulo("");
      setSubtitulo("");
      setImagem("");
      setBotao("");
      setLink("");
      setOrdem(1);
      setAtivo(true);
      return;
    }

    setTitulo(banner.titulo);
    setSubtitulo(banner.subtitulo ?? "");
    setImagem(banner.imagem);
    setBotao(banner.botao ?? "");
    setLink(banner.link ?? "");
    setOrdem(banner.ordem);
    setAtivo(banner.ativo);
  }, [banner]);

  if (!open) return null;

  async function salvar() {
    await onSave({
      id: banner?.id,
      titulo,
      subtitulo,
      imagem,
      botao,
      link,
      ordem,
      ativo,
    });

    onClose();
  }

  return (
   <div
  className="
    fixed
    inset-0
    z-50
    overflow-y-auto
    bg-black/50
    p-8
  "
>
  <div
    className="
      flex
      min-h-full
      items-start
      justify-center
    "
  >

      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b p-6">

          <h2 className="text-xl font-semibold">

            {banner
              ? "Editar Banner"
              : "Novo Banner"}

          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        {/* Conteúdo */}

        <div className="space-y-5 p-6">

          <div>

            <label className="text-sm font-medium">
              Título
            </label>

            <input
              value={titulo}
              onChange={(e) =>
                setTitulo(e.target.value)
              }
              className="mt-1 w-full rounded-lg border p-3"
            />

          </div>

          <div>

            <label className="text-sm font-medium">
              Subtítulo
            </label>

            <textarea
              value={subtitulo}
              onChange={(e) =>
                setSubtitulo(e.target.value)
              }
              className="mt-1 w-full rounded-lg border p-3"
            />

          </div>

<div>
  <label className="mb-2 block text-sm font-medium">
    Imagem do Banner
  </label>

  <div className="space-y-4">

    {imagem ? (
      <div className="relative aspect-[1920/500] w-full overflow-hidden rounded-xl border bg-zinc-100">
        <Image
          src={imagem}
          alt="Banner"
          fill
          className="object-contain"
        />
      </div>
    ) : (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
        <p className="text-sm text-zinc-500">
          Nenhuma imagem selecionada
        </p>
      </div>
    )}

    <label
      className="
        flex
        cursor-pointer
        items-center
        justify-center
        rounded-xl
        bg-violet-600
        px-5
        py-3
        font-medium
        text-white
        transition
        hover:bg-violet-700
      "
    >
      {uploading
        ? "Enviando..."
        : imagem
        ? "Trocar imagem"
        : "Selecionar imagem"}

      <input
        hidden
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={async (e) => {
          const arquivo = e.target.files?.[0];

          if (!arquivo) return;

          setUploading(true);

          try {
            const url = await uploadBanner(
              arquivo
            );

            setImagem(url);
          } catch (error) {
            console.error(error);

             toast.error(
              "Erro ao enviar a imagem."
            );
          } finally {
            setUploading(false);
          }
        }}
      />
    </label>

    <p className="text-xs text-zinc-500">
      Recomendado: 1920 × 500 pixels.
    </p>

  </div>
</div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="text-sm font-medium">
                Texto do botão
              </label>

              <input
                value={botao}
                onChange={(e) =>
                  setBotao(e.target.value)
                }
                className="mt-1 w-full rounded-lg border p-3"
              />

            </div>

            <div>

              <label className="text-sm font-medium">
                Link
              </label>

              <input
                value={link}
                onChange={(e) =>
                  setLink(e.target.value)
                }
                className="mt-1 w-full rounded-lg border p-3"
              />

            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="text-sm font-medium">
                Ordem
              </label>

              <input
                type="number"
                value={ordem}
                onChange={(e) =>
                  setOrdem(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border p-3"
              />

            </div>

            <div className="flex items-end gap-3">

              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) =>
                  setAtivo(e.target.checked)
                }
              />

              <span>Banner ativo</span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end border-t p-6">

          <button
            onClick={salvar}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-violet-600
              px-5
              py-3
              text-white
            "
          >
            <Save size={18} />

            Salvar

          </button>

        </div>

      </div>

    </div>
</div>
  );
}