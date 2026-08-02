"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { Produto } from "@/src/components/produto/types/produtos";
import { variantImageMatcher } from "@/src/services/products/images/VariantImageMatcher";
import { variantImageService } from "@/src/services/products/services/VariantImageService";

type Props = {
  produto: Produto;
  variacao?: any;
};

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function extractColorFromCombinedValue(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed.includes("-")) {
    return null;
  }

  const parts = trimmed.split("-").map((part) => part.trim()).filter(Boolean);

  if (parts.length < 2) {
    return null;
  }

  return parts.slice(0, -1).join("-");
}

function getSelectedColor(variacaoState: any, variacaoSelecionada: any): string | null {
  const selectedAttributes = variacaoState?.atributosSelecionados;

  if (selectedAttributes && typeof selectedAttributes === "object") {
    for (const [attributeName, attributeValue] of Object.entries(selectedAttributes)) {
      if (typeof attributeValue !== "string" || !attributeValue.trim()) {
        continue;
      }

      if (normalizeSearchValue(attributeName).includes("cor")) {
        return attributeValue.trim();
      }
    }

    for (const attributeValue of Object.values(selectedAttributes)) {
      if (typeof attributeValue !== "string") {
        continue;
      }

      const combinedColor = extractColorFromCombinedValue(attributeValue);
      if (combinedColor) {
        return combinedColor;
      }
    }
  }

  const itemColor = variacaoSelecionada?.produto_variacao_item?.find((item: any) => {
    const tipo = item?.variacao_valor?.variacao_tipo?.nome;
    return typeof tipo === "string" && normalizeSearchValue(tipo).includes("cor");
  });

  const valueFromItem = itemColor?.variacao_valor?.valor;
  if (typeof valueFromItem === "string" && valueFromItem.trim()) {
    return valueFromItem.trim();
  }

  return null;
}

function getVariationColor(variation: any): string | null {
  const colorItem = variation?.produto_variacao_item?.find((item: any) => {
    const tipo = item?.variacao_valor?.variacao_tipo?.nome;
    return typeof tipo === "string" && normalizeSearchValue(tipo).includes("cor");
  });

  const valueFromColorItem = colorItem?.variacao_valor?.valor;
  if (typeof valueFromColorItem === "string" && valueFromColorItem.trim()) {
    return valueFromColorItem.trim();
  }

  const combinedItem = variation?.produto_variacao_item?.find((item: any) => {
    const value = item?.variacao_valor?.valor;
    return typeof value === "string" && value.includes("-");
  });

  const combinedValue = combinedItem?.variacao_valor?.valor;
  if (typeof combinedValue === "string") {
    return extractColorFromCombinedValue(combinedValue);
  }

  return null;
}

function imageMatchesSelectedColor(imagePath: string, selectedColor: string): boolean {
  const filenameOnly = imagePath
    .split("?")[0]
    .split("#")[0]
    .split(/[\\/]/)
    .filter(Boolean)
    .pop() ?? imagePath;
  const normalizedPath = normalizeSearchValue(filenameOnly)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
  const normalizedColor = normalizeSearchValue(selectedColor)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (!normalizedPath || !normalizedColor) {
    return false;
  }

  const colorParts = normalizedColor.split(" ").filter(Boolean);
  return colorParts.every((part) => normalizedPath.includes(part));
}

function getVariationValueIds(variation: any): number[] {
  return (variation?.produto_variacao_item ?? [])
    .map((item: any) => Number(item?.id_valor))
    .filter((id: number) => Number.isFinite(id));
}

function reorderImagesByPriority<T extends { id: number }>(images: T[], priority: T[]): T[] {
  const seenIds = new Set<number>();
  const ordered: T[] = [];

  for (const image of priority) {
    if (seenIds.has(image.id)) {
      continue;
    }

    seenIds.add(image.id);
    ordered.push(image);
  }

  for (const image of images) {
    if (seenIds.has(image.id)) {
      continue;
    }

    seenIds.add(image.id);
    ordered.push(image);
  }

  return ordered;
}

export default function ProductGallery({ produto, variacao }: Props) {
  const variacaoSelecionada = variacao?.variacaoSelecionada;
  const variacoes = Array.isArray(variacao?.variacoes) ? variacao.variacoes : [];
  const corSelecionada = getSelectedColor(variacao, variacaoSelecionada);
  const selecionarVariacao =
    typeof variacao?.selecionarVariacao === "function"
      ? variacao.selecionarVariacao
      : null;

  const todasAsImagens = useMemo(
    () =>
      (produto.produto_imagem ?? [])
        .slice()
        .sort((left, right) => left.ordem - right.ordem)
        .map((img) => ({
          ...img,
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/${img.caminho}`,
        })),
    [produto.produto_imagem]
  );

  const { imagens, prioridadeVariacaoId } = useMemo(() => {
    if (!variacaoSelecionada) {
      return {
        imagens: todasAsImagens,
        prioridadeVariacaoId: null as number | null,
      };
    }

    if (corSelecionada) {
      const colorImages = todasAsImagens.filter((imagem) =>
        imageMatchesSelectedColor(imagem.caminho, corSelecionada)
      );

      if (colorImages.length > 0) {
        return {
          imagens: reorderImagesByPriority(todasAsImagens, colorImages),
          prioridadeVariacaoId: colorImages[0]?.id ?? null,
        };
      }
    }

    const linkedImageIds = new Set(
      variantImageService.getLinkedImageIds(variacaoSelecionada)
    );
    const linkedImages = todasAsImagens.filter((imagem) => linkedImageIds.has(imagem.id));

    if (linkedImages.length > 0) {
      return {
        imagens: reorderImagesByPriority(todasAsImagens, linkedImages),
        prioridadeVariacaoId: linkedImages[0]?.id ?? null,
      };
    }

    const variationValueIds = new Set(getVariationValueIds(variacaoSelecionada));
    const legacyValueImages = todasAsImagens.filter((imagem) => {
      if (imagem.id_valor == null) {
        return false;
      }

      return variationValueIds.has(Number(imagem.id_valor));
    });

    if (legacyValueImages.length > 0) {
      return {
        imagens: reorderImagesByPriority(todasAsImagens, legacyValueImages),
        prioridadeVariacaoId: legacyValueImages[0]?.id ?? null,
      };
    }

    const imagemPrincipalVariacao =
      variacaoSelecionada?.imagem_principal ??
      variacaoSelecionada?.item?.imagem_principal ??
      null;
    const matchedImage = variantImageMatcher.match(imagemPrincipalVariacao, todasAsImagens);

    if (matchedImage) {
      return {
        imagens: reorderImagesByPriority(todasAsImagens, [matchedImage]),
        prioridadeVariacaoId: matchedImage.id,
      };
    }

    return {
      imagens: todasAsImagens,
      prioridadeVariacaoId: null as number | null,
    };
  }, [todasAsImagens, variacaoSelecionada, corSelecionada]);
  const [imagemSelecionadaId, setImagemSelecionadaId] = useState<number | null>(
    todasAsImagens[0]?.id ?? null
  );
  const [usarImagemFallbackVariacao, setUsarImagemFallbackVariacao] = useState(false);

  const imagemPrincipalVariacaoSelecionada =
    variacaoSelecionada?.imagem_principal ??
    variacaoSelecionada?.item?.imagem_principal ??
    null;

  const fallbackImagemVariacaoUrl = useMemo(() => {
    if (prioridadeVariacaoId != null) {
      return null;
    }

    if (typeof imagemPrincipalVariacaoSelecionada !== "string") {
      return null;
    }

    const normalized = imagemPrincipalVariacaoSelecionada.trim();

    if (!normalized) {
      return null;
    }

    if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
      return normalized;
    }

    return null;
  }, [imagemPrincipalVariacaoSelecionada, prioridadeVariacaoId]);

  useEffect(() => {
    if (prioridadeVariacaoId != null) {
      setImagemSelecionadaId(prioridadeVariacaoId);
      setUsarImagemFallbackVariacao(false);
      return;
    }

    setUsarImagemFallbackVariacao(Boolean(fallbackImagemVariacaoUrl));

    if (imagens.length === 0) {
      setImagemSelecionadaId(null);
      return;
    }

    setImagemSelecionadaId((atual) => {
      if (atual != null && imagens.some((imagem) => imagem.id === atual)) {
        return atual;
      }

      return imagens[0]?.id ?? null;
    });
  }, [imagens, prioridadeVariacaoId, fallbackImagemVariacaoUrl]);

  const imagemSelecionada = useMemo(
    () => imagens.find((imagem) => imagem.id === imagemSelecionadaId) ?? imagens[0],
    [imagens, imagemSelecionadaId]
  );

  const imagemPrincipal =
    usarImagemFallbackVariacao && fallbackImagemVariacaoUrl
      ? fallbackImagemVariacaoUrl
      : imagemSelecionada?.url ?? "/placeholder.png";

  const miniaturasEmColunas = imagens.length > 8;

  function encontrarVariacaoDaImagem(
    imageId: number,
    imagePath: string,
    imageValueId?: number | null
  ): any | null {
    let fallbackMatch: any | null = null;

    const colorMatchedVariation = variacoes.find((item: any) => {
      const variationColor = getVariationColor(item);

      if (!variationColor) {
        return false;
      }

      return imageMatchesSelectedColor(imagePath, variationColor);
    });

    if (colorMatchedVariation) {
      return colorMatchedVariation;
    }

    for (const item of variacoes) {
      const linkedIds = new Set(variantImageService.getLinkedImageIds(item));

      if (linkedIds.has(imageId)) {
        return item;
      }

      if (imageValueId != null) {
        const variationValueIds = new Set(getVariationValueIds(item));

        if (variationValueIds.has(Number(imageValueId))) {
          return item;
        }
      }

      const imagemPrincipalVariacao =
        item?.imagem_principal ??
        item?.item?.imagem_principal ??
        null;

      const matchedImage = variantImageMatcher.match(imagemPrincipalVariacao, [{
        id: imageId,
        caminho: imagePath,
      }]);

      if (matchedImage && fallbackMatch == null) {
        fallbackMatch = item;
      }
    }

    return fallbackMatch;
  }

  function handleSelectImage(imagem: { id: number; caminho: string; id_valor?: number | null }): void {
    setUsarImagemFallbackVariacao(false);
    setImagemSelecionadaId(imagem.id);

    if (!selecionarVariacao) {
      return;
    }

    const variacaoDaImagem = encontrarVariacaoDaImagem(
      imagem.id,
      imagem.caminho,
      imagem.id_valor ?? null
    );

    if (!variacaoDaImagem || variacaoDaImagem.id === variacaoSelecionada?.id) {
      return;
    }

    selecionarVariacao(variacaoDaImagem.id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-[22rem] w-full min-w-0 flex-1 items-center justify-center">
        <Image
          src={imagemPrincipal}
          alt={produto.nome}
          width={520}
          height={520}
          priority
          className="h-auto w-full max-w-[34rem] object-contain"
        />
      </div>

      <div
        className={
          miniaturasEmColunas
            ? "grid h-[18rem] w-full grid-flow-col grid-rows-4 auto-cols-[4rem] justify-start gap-3 overflow-x-auto pb-1"
            : "flex w-full flex-wrap justify-center gap-3"
        }
      >
        {imagens.map((imagem) => {
          const ativa = imagemSelecionada?.id === imagem.id;

          return (
            <button
              key={imagem.id}
              onClick={() => handleSelectImage(imagem)}
              className={`overflow-hidden rounded-lg border-2 transition ${
                ativa ? "border-violet-500" : "border-slate-200"
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
    </div>
  );
}
