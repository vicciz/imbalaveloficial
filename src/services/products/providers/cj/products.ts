import { cjRequest } from "./client";
import { mapCJProductToProduct } from "./mapper";

import type { ProductPipeline } from "../../pipeline/ProductPipeline";

interface CjApiResponse<TData> {
  success: boolean;
  message?: string;
  data?: TData;
}

export async function fetchCJProductByPid(pid: string): Promise<unknown> {
  const response = await cjRequest<CjApiResponse<unknown>>(`/product/query?pid=${pid}`);

  if (!response.success || response.data === undefined) {
    throw new Error(response.message ?? "Falha ao obter produto da CJ");
  }

  return response.data;
}

export async function importCJProduct(pid: string, pipeline: ProductPipeline) {
  const rawProduct = await fetchCJProductByPid(pid);
  const product = mapCJProductToProduct(rawProduct);
  return pipeline.execute(product);
}
