import type {
  ProductStage,
  ProductPipelineContext,
} from "../ProductPipeline";

import type {
  Product,
} from "../../types/Product";

export class AIStage
  implements ProductStage
{
  async execute(
    product: Product,
    context: ProductPipelineContext
  ): Promise<Product> {
    console.log("===== AI STAGE =====");

    try {
      const enrichedProduct = await context.enhancer.ai(product);
      console.log("AIStage concluído.");
      return enrichedProduct;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";

      console.log("AI indisponível.");
      console.log(message);
      console.log("Continuando pipeline sem enriquecimento.");

      return product;
    }
  }
}