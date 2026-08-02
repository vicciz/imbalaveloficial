import { ProductEnhancer } from "./enhancer";
import { ProductPipeline } from "./pipeline/ProductPipeline";
import { AIStage } from "./pipeline/stages/AIStage";
import { CleanStage } from "./pipeline/stages/CleanStage";
import { NormalizeStage } from "./pipeline/stages/NormalizeStage";
import { SaveStage } from "./pipeline/stages/SaveStage";
import { SEOStage } from "./pipeline/stages/SEOStage";
import { TranslateStage } from "./pipeline/stages/TranslateStage";
import { ValidationStage } from "./pipeline/stages/ValidationStage";
import { SupabaseProductRepository } from "./repository/product";

import type { ProductRepository } from "./repository/product";

export function createDefaultProductPipeline(
  repository: ProductRepository = new SupabaseProductRepository(),
  enhancer: ProductEnhancer = new ProductEnhancer()
): ProductPipeline {
  return new ProductPipeline({ repository, enhancer })
    .use(new CleanStage())
    .use(new NormalizeStage())
    .use(new TranslateStage())
    .use(new AIStage())
    .use(new SEOStage())
    .use(new ValidationStage())
    .use(new SaveStage());
}
