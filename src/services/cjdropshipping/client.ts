import { obterTokenCJ } from "./auth";

const BASE_URL =
  "https://developers.cjdropshipping.com/api2.0/v1";

export async function cjRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken } =
    await obterTokenCJ();

  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "CJ-Access-Token": accessToken,
        ...options.headers,
      },
    }
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(
      json.message ?? "Erro na API"
    );
  }

  return json;
}