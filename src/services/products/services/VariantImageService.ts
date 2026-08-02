import {
  SupabaseVariantImageRepository,
  type VariantImageLink,
  type VariantImageRepository,
} from "../repository/variantImage";

export interface VariantImageRecord {
  id: number;
  caminho: string;
  ordem: number;
  principal: boolean;
  id_valor?: number | null;
}

export interface VariantImageValueRecord {
  id_valor?: number | null;
  variacao_valor?: {
    valor?: string;
    variacao_tipo?: {
      nome?: string;
    };
  };
}

export interface VariantImageVariationRecord {
  id: number;
  produto_variacao_item?: VariantImageValueRecord[];
  produto_variacao_imagem?: VariantImageLink[];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function sortImages<T extends VariantImageRecord>(images: T[]): T[] {
  return [...images].sort((left, right) => left.ordem - right.ordem);
}

function uniqueImageIds(imageIds: number[]): number[] {
  return Array.from(new Set(imageIds));
}

export class VariantImageService {
  constructor(private readonly repository: VariantImageRepository = new SupabaseVariantImageRepository()) {}

  async saveVariationImages(variationId: number, imageIds: number[]): Promise<VariantImageLink[]> {
    return this.repository.syncVariationImages(variationId, uniqueImageIds(imageIds));
  }

  async linkImageToVariation(variationId: number, imageId: number): Promise<void> {
    await this.repository.linkImageToVariation(variationId, imageId);
  }

  getLinkedImageIds(variation: VariantImageVariationRecord | null | undefined): number[] {
    return uniqueImageIds((variation?.produto_variacao_imagem ?? []).map((link) => link.id_imagem));
  }

  getLegacyColorValueId(variation: VariantImageVariationRecord | null | undefined): number | null {
    const colorItem = variation?.produto_variacao_item?.find((item) => {
      const typeName = item.variacao_valor?.variacao_tipo?.nome;
      return typeof typeName === "string" && normalize(typeName) === "cor";
    });

    return colorItem?.id_valor ?? null;
  }

  getGeneralImages<T extends VariantImageRecord>(images: T[]): T[] {
    const generalImages = sortImages(images.filter((image) => image.id_valor == null));
    return generalImages.length > 0 ? generalImages : sortImages(images);
  }

  getVariationImages<T extends VariantImageRecord>(
    images: T[],
    variation: VariantImageVariationRecord | null | undefined
  ): T[] {
    const linkedImageIds = new Set(this.getLinkedImageIds(variation));

    if (linkedImageIds.size > 0) {
      const linkedImages = sortImages(images.filter((image) => linkedImageIds.has(image.id)));

      if (linkedImages.length > 0) {
        return linkedImages;
      }
    }

    const legacyColorValueId = this.getLegacyColorValueId(variation);

    if (legacyColorValueId != null) {
      const legacyImages = sortImages(images.filter((image) => image.id_valor === legacyColorValueId));

      if (legacyImages.length > 0) {
        return legacyImages;
      }
    }

    return this.getGeneralImages(images);
  }

  getPrimaryImage<T extends VariantImageRecord>(
    images: T[],
    variation: VariantImageVariationRecord | null | undefined
  ): T | null {
    const variationImages = this.getVariationImages(images, variation);

    if (variationImages.length === 0) {
      return null;
    }

    return variationImages.find((image) => image.principal) ?? variationImages[0] ?? null;
  }
}

export const variantImageService = new VariantImageService();
