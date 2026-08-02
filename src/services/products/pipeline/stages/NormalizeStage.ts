import type { ProductStage, ProductPipelineContext } from "../ProductPipeline";
import type { Product } from "../../types/Product";

export class NormalizeStage implements ProductStage {
  async execute(product: Product, context: ProductPipelineContext): Promise<Product> {
    console.log("===== NORMALIZE STAGE =====");
    return context.enhancer.normalize(product);
  }
}
