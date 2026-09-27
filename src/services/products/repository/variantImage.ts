import { supabase } from "@/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseErrorMessage } from "./supabaseError";

export interface VariantImageLink {
  id: number;
  id_variacao: number;
  id_imagem: number;
}

interface VariantImageLinkRow {
  id: number;
  id_variacao: number;
  id_imagem: number;
}

interface VariantImageLinkInsert {
  id_variacao: number;
  id_imagem: number;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isVariantImageTableMissing(error: unknown): boolean {
  if (!isObject(error)) {
    return false;
  }

  const code = typeof error.code === "string" ? error.code : "";
  const message = typeof error.message === "string" ? error.message : "";
  const details = typeof error.details === "string" ? error.details : "";

  const fullMessage = `${message} ${details}`.toLowerCase();

  return (
    code === "42P01" ||
    code === "PGRST200" ||
    fullMessage.includes("produto_variacao_imagem") ||
    fullMessage.includes("could not find a relationship") ||
    fullMessage.includes("relation") && fullMessage.includes("does not exist")
  );
}

function logVariantImageFallback(operation: string, error: unknown): void {
  console.warn("===== VARIANT IMAGE LINK =====");
  console.warn(`Operação ignorada: ${operation}`);
  console.warn(supabaseErrorMessage(error, "Erro ao acessar imagens da variação"));
  console.warn("Continuando sem tabela produto_variacao_imagem.");
}

export interface VariantImageRepository {
  listByVariationId(variationId: number): Promise<VariantImageLink[]>;
  syncVariationImages(variationId: number, imageIds: number[]): Promise<VariantImageLink[]>;
  linkImageToVariation(variationId: number, imageId: number): Promise<void>;
}

export class SupabaseVariantImageRepository implements VariantImageRepository {
  constructor(private readonly client: SupabaseClient = supabase) {}

  async listByVariationId(variationId: number): Promise<VariantImageLink[]> {
    const { data, error } = await this.client
      .from("produto_variacao_imagem")
      .select("id,id_variacao,id_imagem")
      .eq("id_variacao", variationId);

    if (error) {
      if (isVariantImageTableMissing(error)) {
        logVariantImageFallback("listByVariationId", error);
        return [];
      }

      throw new Error(supabaseErrorMessage(error, "Falha ao listar imagens da variação"));
    }

    return (data as VariantImageLinkRow[] | null) ?? [];
  }

  async syncVariationImages(variationId: number, imageIds: number[]): Promise<VariantImageLink[]> {
    const uniqueImageIds = Array.from(new Set(imageIds));
    const existingLinks = await this.listByVariationId(variationId);
    const existingImageIds = new Set(existingLinks.map((link) => link.id_imagem));

    const removableLinkIds = existingLinks
      .filter((link) => !uniqueImageIds.includes(link.id_imagem))
      .map((link) => link.id);

    if (removableLinkIds.length > 0) {
      const { error } = await this.client.from("produto_variacao_imagem").delete().in("id", removableLinkIds);

      if (error) {
        if (isVariantImageTableMissing(error)) {
          logVariantImageFallback("syncVariationImages.delete", error);
          return [];
        }

        throw new Error(supabaseErrorMessage(error, "Falha ao remover vínculos de imagem da variação"));
      }
    }

    const missingLinks: VariantImageLinkInsert[] = uniqueImageIds
      .filter((imageId) => !existingImageIds.has(imageId))
      .map((imageId) => ({
        id_variacao: variationId,
        id_imagem: imageId,
      }));

    if (missingLinks.length > 0) {
      const { error } = await this.client.from("produto_variacao_imagem").insert(missingLinks);

      if (error) {
        if (isVariantImageTableMissing(error)) {
          logVariantImageFallback("syncVariationImages.insert", error);
          return existingLinks;
        }

        throw new Error(supabaseErrorMessage(error, "Falha ao criar vínculos de imagem da variação"));
      }
    }

    return this.listByVariationId(variationId);
  }

  async linkImageToVariation(variationId: number, imageId: number): Promise<void> {
    const existingLinks = await this.listByVariationId(variationId);

    if (existingLinks.some((link) => link.id_imagem === imageId)) {
      return;
    }

    const { error } = await this.client.from("produto_variacao_imagem").insert({
      id_variacao: variationId,
      id_imagem: imageId,
    });

    if (error) {
      if (isVariantImageTableMissing(error)) {
        logVariantImageFallback("linkImageToVariation", error);
        return;
      }

      throw new Error(supabaseErrorMessage(error, "Falha ao vincular imagem à variação"));
    }
  }
}
