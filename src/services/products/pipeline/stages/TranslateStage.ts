import type { ProductStage, ProductPipelineContext } from "../ProductPipeline";
import type { Product } from "../../types/Product";

export class TranslateStage implements ProductStage {
  async execute(product: Product, context: ProductPipelineContext): Promise<Product> {
    console.log("===== TRANSLATE STAGE =====");
    return context.enhancer.translate(product);
  }
}
