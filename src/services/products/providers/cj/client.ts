import { getCJAccessToken } from "./auth";

const BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";

interface CjErrorResponse {
  message?: string;
}

export async function cjRequest<TResponse>(endpoint: string, options: RequestInit = {}): Promise<TResponse> {
  const accessToken = await getCJAccessToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": accessToken,
      ...options.headers,
    },
  });

  const payload = (await response.json()) as TResponse | CjErrorResponse;

  if (!response.ok) {
    const errorPayload = payload as CjErrorResponse;
    throw new Error(errorPayload.message ?? "Erro na API da CJ");
  }

  return payload as TResponse;
}
