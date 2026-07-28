"use client";

import { useEffect, useState } from "react";

import { AdminLayout } from "@/src/components/layout/Admin";

import BannerUpload from "./componentes/BannerUpload";
import BannerConfig from "./componentes/BannerConfig";
import BannerList from "./componentes/BannerList";
import BannerModal from "./componentes/BannerModal";

import type { Banner } from "@/src/services/banner/types";

import {
  listarBanners,
  criarBanner,
  atualizarBanner,
  excluirBanner,
  alterarStatus,
  alterarOrdem,
} from "@/src/services/banner";

export default function BannerPage() {
  const [banners, setBanners] =
    useState<Banner[]>([]);

  const [openModal, setOpenModal] =
    useState(false);

  const [selectedBanner, setSelectedBanner] =
    useState<Banner | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data, error } =
      await listarBanners();

    if (error) {
      console.error(error);
      return;
    }

    setBanners(data ?? []);
  }

  async function salvarBanner(
    banner: Partial<Banner>
  ) {
    if (banner.id) {
      await atualizarBanner(
        banner.id,
        banner
      );
    } else {
      await criarBanner({
        titulo: banner.titulo ?? "",
        subtitulo:
          banner.subtitulo ?? "",
        imagem:
          banner.imagem ?? "",
        botao:
          banner.botao ?? "",
        link:
          banner.link ?? "",
        ordem:
          banner.ordem ??
          banners.length + 1,
        ativo:
          banner.ativo ?? true,
      });
    }

    setOpenModal(false);

    carregar();
  }

  async function remover(
    id: number
  ) {
    await excluirBanner(id);

    carregar();
  }

  async function alterarAtivo(
    id: number,
    ativo: boolean
  ) {
    await alterarStatus(id, ativo);

    carregar();
  }

  async function mover(
    activeId: number,
    overId: number
  ) {
    const lista = [...banners].sort(
      (a, b) =>
        a.ordem - b.ordem
    );

    const oldIndex =
      lista.findIndex(
        (b) => b.id === activeId
      );

    const newIndex =
      lista.findIndex(
        (b) => b.id === overId
      );

    if (
      oldIndex === -1 ||
      newIndex === -1
    ) {
      return;
    }

    const [item] =
      lista.splice(
        oldIndex,
        1
      );

    lista.splice(
      newIndex,
      0,
      item
    );

    const atualizados =
      lista.map(
        (
          banner,
          index
        ) => ({
          ...banner,
          ordem:
            index + 1,
        })
      );

    setBanners(atualizados);

    await Promise.all(
      atualizados.map(
        (banner) =>
          alterarOrdem(
            banner.id,
            banner.ordem
          )
      )
    );

    carregar();
  }

  return (
    <AdminLayout>

      <div className="mx-auto max-w-7xl space-y-6 p-8">

        {/* TOPO */}

        <div
          className="
            grid
            gap-6
            lg:grid-cols-[320px_1fr]
          "
        >

          <BannerUpload
            onClick={() => {
              setSelectedBanner(
                null
              );

              setOpenModal(
                true
              );
            }}
          />

          <BannerConfig />

        </div>

        {/* LISTA */}

        <div
          className="
            rounded-3xl
            bg-white
            p-6
            shadow-sm
          "
        >

          <BannerList
            banners={banners}
            onEdit={(id) => {
              const banner =
                banners.find(
                  (b) =>
                    b.id === id
                );

              if (!banner)
                return;

              setSelectedBanner(
                banner
              );

              setOpenModal(
                true
              );
            }}
            onDelete={
              remover
            }
            onToggle={
              alterarAtivo
            }
            onMove={mover}
          />

        </div>

      </div>

      <BannerModal
        open={openModal}
        banner={
          selectedBanner
        }
        onClose={() =>
          setOpenModal(false)
        }
        onSave={salvarBanner}
      />

    </AdminLayout>
  );
}