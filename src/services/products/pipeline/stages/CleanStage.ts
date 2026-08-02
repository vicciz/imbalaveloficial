import type { ProductStage, ProductPipelineContext } from "../ProductPipeline";
import type { Product } from "../../types/Product";

export class CleanStage implements ProductStage {
  async execute(product: Product, context: ProductPipelineContext): Promise<Product> {
    console.log("===== CLEAN STAGE =====");
    return context.enhancer.clean(product);
  }
}
