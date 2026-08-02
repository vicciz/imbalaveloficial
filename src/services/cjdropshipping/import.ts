import { createDefaultProductPipeline } from "@/src/services/products/import";
import { importCJProduct } from "@/src/services/products/providers/cj/products";

export async function importarProdutoCJ(
  pid: string
) {
  const pipeline = createDefaultProductPipeline();
  return importCJProduct(pid, pipeline);
}