const BASE_URL =
  "https://developers.cjdropshipping.com/api2.0/v1";

export async function obterTokenCJ() {
  const apiKey = process.env.CJ_API_KEY;

  if (!apiKey) {
    throw new Error("CJ_API_KEY não configurada.");
  }

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

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(
      json.message ?? "Erro ao autenticar no CJ."
    );
  }

  return json.data;
}