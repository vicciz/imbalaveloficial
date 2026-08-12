import {
  invalidarTokenCJ,
  obterTokenCJ,
} from "./auth";
import { waitForCjSlot } from "./rateLimit";

const BASE_URL =
  "https://developers.cjdropshipping.com/api2.0/v1";

async function requestWithToken<T>(
  endpoint: string,
  options: RequestInit,
  accessToken: string
) {
  await waitForCjSlot();

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

  const json = await response.json().catch(() => ({}));

  return { response, json };
}

export async function cjRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let { accessToken } = await obterTokenCJ();

  // One normal attempt + one recovery attempt for an expired/invalid token.
  for (let authAttempt = 0; authAttempt < 2; authAttempt += 1) {
    const { response, json } =
      await requestWithToken<T>(
        endpoint,
        options,
        accessToken
      );

    // CJ uses 1600001 for an invalid API key/access token.
    const invalidToken =
      response.status === 401 ||
      String(json?.code ?? "") === "1600001" ||
      /invalid api key or access token/i.test(
        String(json?.message ?? json?.msg ?? "")
      );

    if (invalidToken && authAttempt === 0) {
      invalidarTokenCJ();

      // Only CJ_API_KEY can recover an expired access token automatically.
      if (!process.env.CJ_API_KEY?.trim()) {
        throw new Error(
          "O CJ_ACCESS_TOKEN é inválido ou expirou. Configure também CJ_API_KEY para renovação automática."
        );
      }

      ({ accessToken } = await obterTokenCJ({
        forceRefresh: true,
      }));

      // The authentication request itself is separate from the API request;
      // the next request is still protected by the 1 req/s gate.
      continue;
    }

    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const retry = await requestWithToken<T>(
        endpoint,
        options,
        accessToken
      );

      if (!retry.response.ok) {
        throw new Error(
          retry.json?.message ??
          retry.json?.msg ??
          `Erro na API CJ (${retry.response.status})`
        );
      }

      return retry.json as T;
    }

    if (!response.ok) {
      throw new Error(
        json?.message ??
        json?.msg ??
        `Erro na API CJ (${response.status})`
      );
    }

    return json as T;
  }

  throw new Error("Não foi possível autenticar na API da CJ.");
}
