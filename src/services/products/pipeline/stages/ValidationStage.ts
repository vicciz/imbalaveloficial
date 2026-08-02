import type { ProductStage, ProductPipelineContext } from "../ProductPipeline";
import type { Product } from "../../types/Product";

function assertNonEmpty(value: string, message: string): void {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export class ValidationStage implements ProductStage {
  async execute(product: Product, _context: ProductPipelineContext): Promise<Product> {
    console.log("===== VALIDATION STAGE =====");
    assertNonEmpty(product.externalId, "externalId obrigatório");
    assertNonEmpty(product.source, "source obrigatório");
    assertNonEmpty(product.title, "title obrigatório");
    assertNonEmpty(product.supplier.name, "supplier obrigatório");
    assertNonEmpty(product.brand.name, "brand obrigatório");
    assertNonEmpty(product.category.name, "category obrigatório");

    return product;
  }
}
