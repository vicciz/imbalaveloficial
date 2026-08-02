import type { Product } from "../types/Product";

// Placeholder translator: keeps architecture stable while allowing future provider injection.
export async function translateProduct(product: Product): Promise<Product> {
  return {
    ...product,
  };
}
