import { waitForCjSlot } from "./rateLimit";

const BASE_URL =
  "https://developers.cjdropshipping.com/api2.0/v1";

type CachedToken = {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
};

let cachedToken: CachedToken | null = null;
let tokenPromise: Promise<{ accessToken: string }> | null = null;

function expiryFromDate(value: unknown, fallbackMs: number) {
  const timestamp = Date.parse(String(value ?? ""));
  if (Number.isFinite(timestamp)) return timestamp;
  return Date.now() + fallbackMs;
}

function configuredTokenIsUsable() {
  const token = process.env.CJ_ACCESS_TOKEN?.trim();
  if (!token) return false;

  const configuredExpiry = process.env.CJ_ACCESS_TOKEN_EXPIRY?.trim();
  if (!configuredExpiry) return true;

  const timestamp = Date.parse(configuredExpiry);
  return Number.isFinite(timestamp) && timestamp > Date.now() + 5 * 60 * 1000;
}

export function invalidarTokenCJ() {
  cachedToken = null;
}

async function obterNovoTokenPorApiKey(apiKey: string) {
  await waitForCjSlot();

  const response = await fetch(
    `${BASE_URL}/authentication/getAccessToken`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apiKey }),
      cache: "no-store",
    }
  );

  const json = await response.json().catch(() => ({}));

  if (!response.ok || !json.success) {
    throw new Error(json.message ?? "Erro ao autenticar no CJ.");
  }

  const accessToken = String(json?.data?.accessToken ?? "").trim();
  if (!accessToken) {
    throw new Error("A CJ não retornou um accessToken válido.");
  }

  const expiresAt = expiryFromDate(
    json?.data?.accessTokenExpiryDate,
    15 * 24 * 60 * 60 * 1000
  );

  cachedToken = {
    accessToken,
    expiresAt,
    refreshToken: String(json?.data?.refreshToken ?? "").trim() || undefined,
  };

  return { accessToken };
}

async function obterNovoTokenPorRefresh(refreshToken: string) {
  await waitForCjSlot();

  const response = await fetch(
    `${BASE_URL}/authentication/refreshAccessToken`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }
  );

  const json = await response.json().catch(() => ({}));

  if (!response.ok || !json.success) {
    throw new Error(json.message ?? "Não foi possível renovar o token da CJ.");
  }

  const accessToken = String(json?.data?.accessToken ?? "").trim();
  if (!accessToken) {
    throw new Error("A CJ não retornou um accessToken renovado válido.");
  }

  const novoRefreshToken =
    String(json?.data?.refreshToken ?? refreshToken).trim() || refreshToken;

  cachedToken = {
    accessToken,
    expiresAt: expiryFromDate(
      json?.data?.accessTokenExpiryDate,
      15 * 24 * 60 * 60 * 1000
    ),
    refreshToken: novoRefreshToken,
  };

  return { accessToken };
}

export async function obterTokenCJ(options?: {
  forceRefresh?: boolean;
}): Promise<{ accessToken: string }> {
  const forceRefresh = options?.forceRefresh === true;
  const apiKey = process.env.CJ_API_KEY?.trim();
  const configuredToken = process.env.CJ_ACCESS_TOKEN?.trim();
  const configuredRefreshToken = process.env.CJ_REFRESH_TOKEN?.trim();

  if (!forceRefresh && configuredToken && configuredTokenIsUsable()) {
    return { accessToken: configuredToken };
  }

  if (
    !forceRefresh &&
    cachedToken &&
    cachedToken.expiresAt > Date.now() + 5 * 60 * 1000
  ) {
    return { accessToken: cachedToken.accessToken };
  }

  if (tokenPromise) return tokenPromise;

  if (!apiKey && !configuredRefreshToken && !cachedToken?.refreshToken) {
    if (configuredToken) return { accessToken: configuredToken };
    throw new Error(
      "CJ_API_KEY, CJ_REFRESH_TOKEN ou CJ_ACCESS_TOKEN precisa estar configurado."
    );
  }

  tokenPromise = (async () => {
    const refreshToken =
      configuredRefreshToken || cachedToken?.refreshToken || "";

    if (forceRefresh && refreshToken) {
      try {
        return await obterNovoTokenPorRefresh(refreshToken);
      } catch (refreshError) {
        console.warn("[CJ AUTH] Refresh token falhou; tentando API Key.", {
          error:
            refreshError instanceof Error
              ? refreshError.message
              : "Erro desconhecido.",
        });
      }
    }

    if (apiKey) {
      return obterNovoTokenPorApiKey(apiKey);
    }

    if (configuredToken && !forceRefresh) {
      return { accessToken: configuredToken };
    }

    throw new Error(
      "Não foi possível obter um accessToken válido da CJ. Configure CJ_API_KEY ou CJ_REFRESH_TOKEN para renovação automática."
    );
  })();

  try {
    return await tokenPromise;
  } finally {
    tokenPromise = null;
  }
}
