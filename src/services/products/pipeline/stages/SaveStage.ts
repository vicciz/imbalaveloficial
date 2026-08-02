import type { ProductStage, ProductPipelineContext } from "../ProductPipeline";
import type { Product } from "../../types/Product";

export class SaveStage implements ProductStage {
  async execute(product: Product, context: ProductPipelineContext): Promise<Product> {
    console.log("===== SAVE STAGE =====");
    return context.repository.save(product);
  }
}
