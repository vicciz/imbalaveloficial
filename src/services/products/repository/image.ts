import { randomUUID } from "crypto";

import "server-only";

import { getSupabaseAdminClient } from "./adminSupabase";
import { supabaseErrorMessage } from "./supabaseError";

import type { ProductImage } from "../types/ProductImage";

interface ImageRow {
  id: number;
  caminho: string;
  principal: boolean;
  ordem: number;
}

interface ImagePayload {
  id_produto: number;
  caminho: string;
  ordem: number;
  principal: boolean;
}

export interface SavedProductImage {
  id: number;
  sourceUrl: string;
  path: string;
  order: number;
  isPrimary: boolean;
}

async function uploadImageFromUrl(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Falha ao baixar imagem");
  }

  const buffer = await response.arrayBuffer();
  const path = `${randomUUID()}.jpg`;

  const { error } = await getSupabaseAdminClient().storage.from("produtos").upload(path, buffer, {
    contentType: response.headers.get("content-type") ?? "image/jpeg",
  });

  if (error) {
    throw new Error(supabaseErrorMessage(error, "Falha ao enviar imagem para storage"));
  }

  return path;
}

export async function saveImages(productId: number, images: ProductImage[]): Promise<SavedProductImage[]> {
  const validImages = images.filter((image) => image.url.trim().length > 0);

  if (validImages.length === 0) {
    return [];
  }

  const payload: ImagePayload[] = [];
  const imageSourcesByPath = new Map<string, ProductImage>();
  const seenUrls = new Set<string>();

  for (const image of validImages) {
    const normalizedUrl = image.url.trim();

    if (seenUrls.has(normalizedUrl)) {
      continue;
    }

    seenUrls.add(normalizedUrl);

    const storedPath = await uploadImageFromUrl(image.url);

    imageSourcesByPath.set(storedPath, image);

    payload.push({
      id_produto: productId,
      caminho: storedPath,
      ordem: image.order,
      principal: image.isPrimary,
    });
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("produto_imagem")
    .insert(payload)
    .select("id,caminho,principal,ordem");

  if (error) {
    throw new Error(supabaseErrorMessage(error, "Falha ao salvar imagens"));
  }

  if (!data) {
    throw new Error("Falha ao salvar imagens: Supabase não retornou os registros.");
  }

  return (data as ImageRow[]).map((item) => {
    const sourceImage = imageSourcesByPath.get(item.caminho);

    return {
      id: item.id,
      sourceUrl: sourceImage?.url ?? "",
      path: item.caminho,
      order: item.ordem,
      isPrimary: item.principal,
    };
  });
}
