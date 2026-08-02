import type { ProductStage, ProductPipelineContext } from "../ProductPipeline";
import type { Product } from "../../types/Product";

export class SEOStage implements ProductStage {
  async execute(product: Product, context: ProductPipelineContext): Promise<Product> {
    console.log("===== SEO STAGE =====");
    return context.enhancer.seo(product);
  }
}
