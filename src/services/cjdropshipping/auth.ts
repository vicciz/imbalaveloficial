import { waitForCjSlot } from "./rateLimit";

const BASE_URL =
  "https://developers.cjdropshipping.com/api2.0/v1";

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;
let tokenPromise: Promise<{ accessToken: string }> | null = null;

export function invalidarTokenCJ() {
  cachedToken = null;
}

export async function obterTokenCJ(options?: {
  forceRefresh?: boolean;
}): Promise<{ accessToken: string }> {
  const forceRefresh = options?.forceRefresh === true;
  const apiKey = process.env.CJ_API_KEY?.trim();
  const configuredToken = process.env.CJ_ACCESS_TOKEN?.trim();

  // A fixed access token is useful only while valid. When it becomes invalid,
  // the client can fall back to CJ_API_KEY and obtain a fresh token.
  if (!forceRefresh && configuredToken) {
    return { accessToken: configuredToken };
  }

  if (
    !forceRefresh &&
    cachedToken &&
    cachedToken.expiresAt > Date.now() + 5 * 60 * 1000
  ) {
    return { accessToken: cachedToken.accessToken };
  }

  if (tokenPromise) {
    return tokenPromise;
  }

  if (!apiKey) {
    if (configuredToken) {
      return { accessToken: configuredToken };
    }

    throw new Error(
      "CJ_API_KEY ou CJ_ACCESS_TOKEN precisa estar configurado."
    );
  }

  tokenPromise = (async () => {
    await waitForCjSlot();

    const response = await fetch(
      `${BASE_URL}/authentication/getAccessToken`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
        }),
      }
    );

    const json = await response.json().catch(() => ({}));

    if (!response.ok || !json.success) {
      throw new Error(
        json.message ?? "Erro ao autenticar no CJ."
      );
    }

    const accessToken = String(json?.data?.accessToken ?? "");
    if (!accessToken) {
      throw new Error("A CJ não retornou um accessToken válido.");
    }

    const expiresInSeconds = Number(
      json?.data?.expiresIn ??
      json?.data?.expiresInSeconds ??
      15 * 24 * 60 * 60
    );

    cachedToken = {
      accessToken,
      expiresAt:
        Date.now() +
        (Number.isFinite(expiresInSeconds)
          ? expiresInSeconds * 1000
          : 15 * 24 * 60 * 60 * 1000),
    };

    return { accessToken };
  })();

  try {
    return await tokenPromise;
  } finally {
    tokenPromise = null;
  }
}
