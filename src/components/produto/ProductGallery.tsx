"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Produto } from "@/src/services/produto/produtos";

type Props = {
  produto: Produto;
  variacao?: any;
};

export default function ProductGallery({
  produto,
  variacao,
}: Props) {
  // Miniaturas da variação selecionada
  const imagens = useMemo(() => {
    const todas = produto.produto_imagem ?? [];

    const itemCor =
      variacao?.variacaoSelecionada?.produto_variacao_item?.find(
        (item: any) =>
          item.variacao_valor?.variacao_tipo?.nome === "Cor"
      );

    const idCor = itemCor?.id_valor;

    let imagensFiltradas = todas;

    if (idCor) {
      const imagensCor = todas.filter(
        (img) => img.id_valor === idCor
      );

      if (imagensCor.length > 0) {
        imagensFiltradas = imagensCor;
      } else {
        imagensFiltradas = todas.filter(
          (img) => img.id_valor == null
        );
      }
    }

    return imagensFiltradas
      .sort((a, b) => a.ordem - b.ordem)
      .map((img) => ({
        ...img,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/${img.caminho}`,
      }));
  }, [produto, variacao]);

  // Uma miniatura principal para cada cor
  const miniaturas = useMemo(() => {
  const todas = produto.produto_imagem ?? [];

  const mapa = new Map<number, any>();

  todas.forEach((img) => {
    if (img.id_valor != null && !mapa.has(img.id_valor)) {
      mapa.set(img.id_valor, img);
    }
  });

  return Array.from(mapa.values())
    .sort((a, b) => a.ordem - b.ordem)
    .map((img) => ({
      ...img,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/${img.caminho}`,
    }));
}, [produto]);
  const [imagemSelecionada, setImagemSelecionada] = useState(0);

  useEffect(() => {
    setImagemSelecionada(0);
  }, [variacao?.variacaoSelecionada?.id]);

  const imagemPrincipal =
    imagens[imagemSelecionada]?.url ?? "/placeholder.png";
  console.table(
    produto.produto_imagem?.map((img) => ({
      id: img.id,
      id_valor: img.id_valor,
      principal: img.principal,
      caminho: img.caminho,
    }))
  );
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex flex-col gap-3">

        {miniaturas.map((imagem) => {
          const ativa =
            variacao?.variacaoSelecionada?.produto_variacao_item?.some(
              (item: any) => item.id_valor === imagem.id_valor
            );

          return (
            <button
              key={imagem.id}
              onClick={() => {
                const item =
                  variacao?.variacoes?.find((v: any) =>
                    v.produto_variacao_item.some(
                      (i: any) => i.id_valor === imagem.id_valor
                    )
                  );

                const cor =
                  item?.produto_variacao_item.find(
                    (i: any) =>
                      i.variacao_valor?.variacao_tipo?.nome ===
                      "Cor"
                  );

                if (cor) {
                  variacao?.selecionarAtributo(
                    "Cor",
                    cor.variacao_valor.valor
                  );
                }
              }}
              className={`overflow-hidden rounded-lg border-2 transition ${
                ativa
                  ? "border-violet-500"
                  : "border-slate-200"
              }`}
            >
              <Image
                src={imagem.url}
                alt=""
                width={60}
                height={60}
                className="h-16 w-16 object-cover"
              />
            </button>
          );
        })}
      </div>

      <div className="flex w-full flex-1 items-center justify-center">
        <Image
          src={imagemPrincipal}
          alt={produto.nome}
          width={520}
          height={520}
          priority
          className="h-auto w-full object-contain"
        />
      </div>
    </div>
  );
}
