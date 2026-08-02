import { mapCJProductToProduct } from "@/src/services/products/providers/cj/mapper";

import type { Product } from "@/src/services/products/types/Product";

export function mapearProdutoCJ(produto: unknown): Product {
  return mapCJProductToProduct(produto);
}
