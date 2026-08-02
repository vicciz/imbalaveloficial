import type { ProductEnhancer } from "../enhancer";
import type { ProductRepository } from "../repository/product";
import type { Product } from "../types/Product";

export interface ProductPipelineContext {
  enhancer: ProductEnhancer;
  repository: ProductRepository;
}

export interface ProductStage {
  execute(product: Product, context: ProductPipelineContext): Promise<Product>;
}

export class ProductPipeline {
  private readonly stages: ProductStage[] = [];
  private readonly context: ProductPipelineContext;

  constructor(context: ProductPipelineContext) {
    this.context = context;
  }

  use(stage: ProductStage): ProductPipeline {
    this.stages.push(stage);
    return this;
  }

  async execute(product: Product): Promise<Product> {
    let current = product;

    for (const stage of this.stages) {
      current = await stage.execute(current, this.context);
    }

    console.log("===== PIPELINE FINALIZADO =====");

    return current;
  }
}
