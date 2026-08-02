import { cjRequest } from "./client";

export interface CjApiResponse<TData> {
  success: boolean;
  message?: string;
  data: TData;
}

export async function buscarProdutos(
  keyWord: string,
  page = 1,
  size = 5
): Promise<CjApiResponse<unknown>> {
  return cjRequest(
    `/product/listV2?page=${page}&size=${size}&keyWord=${encodeURIComponent(
      keyWord
    )}`
  );
}

export async function buscarProdutoPorPid(
  pid: string
): Promise<CjApiResponse<unknown>> {
  return cjRequest(
    `/product/query?pid=${pid}`
  );
}