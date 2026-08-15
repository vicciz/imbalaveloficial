import { supabase } from "@/supabaseClient";

import { getOrCreateBrandId } from "./brand";
import { getOrCreateCategoryId } from "./category";
import { saveImages } from "./image";
import { saveSpecifications } from "./specification";
import { getOrCreateSupplierId } from "./supplier";
import { saveVariants } from "./variation";

import type { SavedProductImage } from "./image";
import type { Product } from "../types/Product";

interface ProductRow {
  id: number;
  nome: string;
}

interface ImportContext {
  productId: number | null;
}

export interface SaveProductResult {
  id: number;
  name: string;
}

export interface ProductRepository {
  save(product: Product): Promise<Product>;
  saveProduct(product: Product): Promise<SaveProductResult>;
  saveImages(productId: number, product: Product): Promise<SavedProductImage[]>;
  saveVariants(productId: number, product: Product, savedImages: SavedProductImage[]): Promise<number[]>;
  saveSpecifications(productId: number, product: Product): Promise<number>;
  rollback(productId: number): Promise<void>;
}

function errorMessage(error: unknown, context: string): string {
  if (error instanceof Error) {
    return `${context}: ${error.message}`;
  }

  return `${context}: Erro desconhecido`;
}

async function deleteVariationItems(productId: number): Promise<void> {
  const { data: variations, error: queryError } = await supabase
    .from("produto_variacao")
    .select("id")
    .eq("id_produto", productId);

  if (queryError) {
    throw new Error(errorMessage(queryError, "Falha ao buscar variacoes para rollback"));
  }

  const variationIds = (variations ?? []).map((item) => item.id as number);

  if (variationIds.length === 0) {
    return;
  }

  const { error: deleteError } = await supabase
    .from("produto_variacao_item")
    .delete()
    .in("id_variacao", variationIds);

  if (deleteError) {
    throw new Error(errorMessage(deleteError, "Falha ao excluir itens de variacao no rollback"));
  }
}

function createImportContext(): ImportContext {
  return {
    productId: null,
  };
}

export class SupabaseProductRepository implements ProductRepository {
  async save(product: Product): Promise<Product> {
    const context = createImportContext();

    try {
      const created = await this.saveProduct(product);
      context.productId = created.id;

      const savedImages = await this.saveImages(created.id, product);
      await this.saveVariants(created.id, product, savedImages);
      await this.saveSpecifications(created.id, product);

      return {
        ...product,
        id: created.id,
      };
    } catch (error) {
      if (context.productId) {
        await this.rollback(context.productId);
      }

      throw new Error(errorMessage(error, "Falha ao salvar produto"));
    }
  }

  async saveProduct(product: Product): Promise<SaveProductResult> {
    const categoryId = await getOrCreateCategoryId(product.category.name);
    const brandId = await getOrCreateBrandId(product.brand.name);
    const supplierId = await getOrCreateSupplierId({
      name: product.supplier.name,
      platformKey: product.platform?.key,
    });

    const payload = {
      nome: product.title,
      descricao: product.shortDescription || "Descrição indisponível.",
      detalhes: product.description || "Detalhes indisponíveis.",
      link: product.externalUrl ?? "",
      rating: 0,
      reviews: 0,
      origem: product.source,
      fornecedor_produto_id: product.externalId,
      external_product_id: product.externalId,
      id_fornecedor: supplierId,
      marca_id: brandId,
      categoria_id: categoryId,
      fornecedor: product.supplier.name,
      markup_percent: product.markupPercent ?? 50,
      markup_percentual: product.markupPercent ?? 50,
      origem_pais_codigo: product.logistics?.originCountryCode ?? null,
      origem_pais_nome: product.logistics?.originCountryName ?? null,
      warehouse_id: product.logistics?.warehouseId ?? null,
    };

    const { data, error } = await supabase.from("produto").insert(payload).select("id,nome").single<ProductRow>();

    if (error || !data) {
      throw new Error(errorMessage(error, "Falha ao salvar produto principal"));
    }

    return {
      id: data.id,
      name: data.nome,
    };
  }

  async saveImages(productId: number, product: Product): Promise<SavedProductImage[]> {
    return saveImages(productId, product.images);
  }

  async saveVariants(
    productId: number,
    product: Product,
    savedImages: SavedProductImage[]
  ): Promise<number[]> {
    return saveVariants(productId, product.variants, savedImages, product.markupPercent ?? 50);
  }

  async saveSpecifications(productId: number, product: Product): Promise<number> {
    return saveSpecifications(productId, product.specifications);
  }

  async rollback(productId: number): Promise<void> {
    await deleteVariationItems(productId);

    const { error: variationTypeError } = await supabase
      .from("produto_variacao_tipo")
      .delete()
      .eq("id_produto", productId);

    if (variationTypeError) {
      throw new Error(errorMessage(variationTypeError, "Falha ao excluir tipos de variacao"));
    }

    const { error: variationError } = await supabase
      .from("produto_variacao")
      .delete()
      .eq("id_produto", productId);

    if (variationError) {
      throw new Error(errorMessage(variationError, "Falha ao excluir variacoes"));
    }

    const { error: specificationError } = await supabase
      .from("produto_especificacao")
      .delete()
      .eq("id_produto", productId);

    if (specificationError) {
      throw new Error(errorMessage(specificationError, "Falha ao excluir especificacoes"));
    }

    const { error: imageError } = await supabase
      .from("produto_imagem")
      .delete()
      .eq("id_produto", productId);

    if (imageError) {
      throw new Error(errorMessage(imageError, "Falha ao excluir imagens"));
    }

    const { error: productError } = await supabase.from("produto").delete().eq("id", productId);

    if (productError) {
      throw new Error(errorMessage(productError, "Falha ao excluir produto"));
    }
  }
}
