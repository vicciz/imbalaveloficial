import { supabase } from "@/supabaseClient";
import { variantImageMatcher, VariantImageMatcher } from "../images/VariantImageMatcher";
import { variantImageService } from "../services/VariantImageService";

import type { SavedProductImage } from "./image";
import type { ProductOption } from "../types/ProductOption";
import type { ProductVariant } from "../types/ProductVariant";

interface IdRow {
  id: number;
}

interface VariationTypeRow {
  id: number;
}

interface VariationValueRow {
  id: number;
}

interface ProductVariationTypeRow {
  id_tipo: number;
}

interface ProductVariationInsert {
  id_produto: number;
  sku: string;
  preco: number;
  estoque: number;
  ativo: boolean;
}

interface ProductVariationItemInsert {
  id_variacao: number;
  id_valor: number;
  preco: number;
  estoque: number;
  sku: string;
  imagem_principal: string | null;
  fornecedor_sku: string;
}

interface ResolvedVariationOption {
  option: ProductOption;
  valueId: number;
}

type SavedProductImageWithPath = SavedProductImage & {
  caminho: string;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function errorMessage(error: unknown, context: string): string {
  if (error instanceof Error) {
    return `${context}: ${error.message}`;
  }

  return `${context}: Erro desconhecido`;
}

function logVariationLink(message: string, details?: unknown): void {
  console.log(message);

  if (details !== undefined) {
    console.log(details);
  }
}

function selectPrimaryProductImage(images: SavedProductImage[]): SavedProductImage | null {
  if (images.length === 0) {
    return null;
  }

  return images.find((image) => image.isPrimary) ?? images[0];
}

async function getOrCreateVariationTypeId(name: string, cache: Map<string, number>): Promise<number> {
  const normalized = normalize(name);

  if (cache.has(normalized)) {
    return cache.get(normalized) as number;
  }

  const cleanedName = name.trim();

  const { data: existing, error: selectError } = await supabase
    .from("variacao_tipo")
    .select("id")
    .ilike("nome", cleanedName)
    .maybeSingle<VariationTypeRow>();

  if (selectError) {
    throw new Error(errorMessage(selectError, "Falha ao buscar tipo de variacao"));
  }

  if (existing) {
    cache.set(normalized, existing.id);
    return existing.id;
  }

  const { data: created, error: createError } = await supabase
    .from("variacao_tipo")
    .insert({ nome: cleanedName })
    .select("id")
    .single<IdRow>();

  if (createError || !created) {
    throw new Error(errorMessage(createError, "Falha ao criar tipo de variacao"));
  }

  cache.set(normalized, created.id);
  return created.id;
}

async function getOrCreateVariationValueId(
  typeId: number,
  value: string,
  cache: Map<string, number>
): Promise<number> {
  const cleanedValue = value.trim();
  const cacheKey = `${typeId}:${normalize(cleanedValue)}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as number;
  }

  const { data: existing, error: selectError } = await supabase
    .from("variacao_valor")
    .select("id")
    .eq("id_tipo", typeId)
    .ilike("valor", cleanedValue)
    .maybeSingle<VariationValueRow>();

  if (selectError) {
    throw new Error(errorMessage(selectError, "Falha ao buscar valor de variacao"));
  }

  if (existing) {
    cache.set(cacheKey, existing.id);
    return existing.id;
  }

  const { data: created, error: createError } = await supabase
    .from("variacao_valor")
    .insert({
      id_tipo: typeId,
      valor: cleanedValue,
    })
    .select("id")
    .single<VariationValueRow>();

  if (createError || !created) {
    throw new Error(errorMessage(createError, "Falha ao criar valor de variacao"));
  }

  cache.set(cacheKey, created.id);
  return created.id;
}

async function linkVariationTypesToProduct(productId: number, typeIds: number[]): Promise<void> {
  if (typeIds.length === 0) {
    return;
  }

  const { data: existing, error: selectError } = await supabase
    .from("produto_variacao_tipo")
    .select("id_tipo")
    .eq("id_produto", productId)
    .in("id_tipo", typeIds);

  if (selectError) {
    throw new Error(errorMessage(selectError, "Falha ao buscar tipos vinculados"));
  }

  const existingSet = new Set(
    ((existing as ProductVariationTypeRow[] | null) ?? []).map((item) => item.id_tipo)
  );

  const missing = typeIds.filter((typeId) => !existingSet.has(typeId));

  if (missing.length === 0) {
    return;
  }

  const payload = missing.map((typeId) => ({
    id_produto: productId,
    id_tipo: typeId,
  }));

  const { error } = await supabase.from("produto_variacao_tipo").insert(payload);

  if (error) {
    throw new Error(errorMessage(error, "Falha ao vincular tipos de variacao"));
  }
}

async function createProductVariation(productId: number, variation: ProductVariant): Promise<number> {
  const payload: ProductVariationInsert = {
    id_produto: productId,
    sku: variation.sku,
    preco: variation.price,
    estoque: variation.stock,
    ativo: variation.active,
  };

  const { data, error } = await supabase
    .from("produto_variacao")
    .insert(payload)
    .select("id")
    .single<IdRow>();

  if (error || !data) {
    throw new Error(errorMessage(error, "Falha ao criar variacao"));
  }

  return data.id;
}

export async function saveVariants(
  productId: number,
  variants: ProductVariant[],
  savedImages: SavedProductImage[]
): Promise<number[]> {
  const typeCache = new Map<string, number>();
  const valueCache = new Map<string, number>();
  const primaryProductImage = selectPrimaryProductImage(savedImages);
  const matcherImages = savedImages.map(
    (image): SavedProductImageWithPath => ({
      ...image,
      caminho: image.path,
    })
  );

  const productTypeIds = new Set<number>();
  const createdVariationIds: number[] = [];

  for (const variant of variants) {
    for (const option of variant.options) {
      const typeId = await getOrCreateVariationTypeId(option.name, typeCache);
      productTypeIds.add(typeId);
    }
  }

  await linkVariationTypesToProduct(productId, Array.from(productTypeIds));

  for (const variant of variants) {
    const variationId = await createProductVariation(productId, variant);
    createdVariationIds.push(variationId);

    const itemPayload: ProductVariationItemInsert[] = [];
    const resolvedOptions: ResolvedVariationOption[] = [];

    for (const option of variant.options) {
      const typeId = await getOrCreateVariationTypeId(option.name, typeCache);
      const valueId = await getOrCreateVariationValueId(typeId, option.value, valueCache);

      resolvedOptions.push({
        option,
        valueId,
      });

      itemPayload.push({
        id_variacao: variationId,
        id_valor: valueId,
        preco: variant.price,
        estoque: variant.stock,
        sku: variant.sku,
        imagem_principal: variant.primaryImageUrl ?? null,
        fornecedor_sku: variant.externalId,
      });
    }

    if (itemPayload.length === 0) {
      continue;
    }

    const { error } = await supabase.from("produto_variacao_item").insert(itemPayload);

    if (error) {
      throw new Error(errorMessage(error, "Falha ao salvar itens de variacao"));
    }

    logVariationLink("===== LINK VARIAÇÕES =====");
    logVariationLink(`SKU: ${variant.sku}`);

    const variationImage = variant.primaryImageUrl ?? null;
    const matchedImage = variantImageMatcher.match(variationImage, matcherImages);
    const selectedImage = matchedImage ?? primaryProductImage;

    if (!selectedImage) {
      logVariationLink("Imagem não encontrada");
      logVariationLink("Sem imagem disponível para vínculo.");
      continue;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("===== VARIANT IMAGE MATCH =====");
      console.log("Variation Image:");
      console.log(variationImage ?? "");
      console.log("Filename:");
      console.log(VariantImageMatcher.extractFilename(variationImage));
      console.log("Matched:");
      console.log(matchedImage ? `produto_imagem.id=${selectedImage.id}` : "No match found.");
    }

    if (!matchedImage) {
      logVariationLink("Imagem não encontrada");
      logVariationLink("Imagem da variação não encontrada. Utilizando imagem principal do produto.");
    } else {
      logVariationLink("Imagem encontrada", selectedImage.path);
    }

    await variantImageService.linkImageToVariation(variationId, selectedImage.id);

    logVariationLink("Imagem vinculada", {
      variationId,
      imageId: selectedImage.id,
      path: selectedImage.path,
    });
  }

  return createdVariationIds;
}

export function mapOptionsFromVariant(variant: ProductVariant): ProductOption[] {
  return variant.options;
}
