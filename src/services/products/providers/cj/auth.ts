const BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";

interface CjTokenResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken?: string;
  };
}

export async function getCJAccessToken(): Promise<string> {
  const apiKey = process.env.CJ_API_KEY;

  if (!apiKey) {
    throw new Error("CJ_API_KEY não configurada");
  }

  const response = await fetch(`${BASE_URL}/authentication/getAccessToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ apiKey }),
  });

  const payload = (await response.json()) as CjTokenResponse;

  if (!response.ok || !payload.success || !payload.data?.accessToken) {
    throw new Error(payload.message ?? "Falha ao autenticar na CJ");
  }

  return payload.data.accessToken;
}
