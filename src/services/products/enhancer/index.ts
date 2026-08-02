import { cleanHtml } from "./cleanHtml";
import { createAIProvider } from "./ai";
import { normalizeSpecs } from "./normalizeSpecs";
import { applySeoDefaults } from "./seo";
import { translateProduct } from "./translate";

import type { Product } from "../types/Product";

export class ProductEnhancer {
  async clean(product: Product): Promise<Product> {
    return {
      ...product,
      description: cleanHtml(product.description),
      shortDescription: cleanHtml(product.shortDescription),
    };
  }

  async normalize(product: Product): Promise<Product> {
    return {
      ...product,
      specifications: normalizeSpecs(product.specifications),
    };
  }

  async translate(product: Product): Promise<Product> {
    return translateProduct(product);
  }

  async ai(product: Product): Promise<Product> {
    const provider = createAIProvider();

    if (!provider) {
      console.log("Provider de IA não configurado. Continuando pipeline sem enriquecimento.");
      return product;
    }

    try {
      const enriched = await provider.generateProduct(product);

      return {
        ...product,
        ...enriched,
        seo: {
          ...product.seo,
          ...enriched.seo,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";

      console.log("AI indisponível.");
      console.log(message);
      console.log("Continuando pipeline sem enriquecimento.");

      return product;
    }
  }

  async seo(product: Product): Promise<Product> {
    return applySeoDefaults(product);
  }

  async enhance(product: Product): Promise<Product> {
    const cleaned = await this.clean(product);
    const normalized = await this.normalize(cleaned);
    const translated = await this.translate(normalized);
    const aiEnhanced = await this.ai(translated);
    return this.seo(aiEnhanced);
  }
}
