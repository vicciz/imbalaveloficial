import { supabase } from "@/supabaseClient";

export interface TratamentoProdutoResult {
  produto: {
    id: number;
    nome: string;
    descricao: string;
    detalhes: string;
  };
}

export async function tratarProdutoComIA(
  produtoId: number
): Promise<TratamentoProdutoResult> {
  if (!Number.isInteger(produtoId) || produtoId <= 0) {
    throw new Error("ID de produto inválido.");
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw new Error("Não foi possível validar a sessão.");
  }

  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  const response = await fetch("/api/ai/tratar-produto", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ produtoId }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      response.status === 503
        ? "O serviço de IA está temporariamente indisponível por alta demanda. Tente novamente em alguns instantes."
        : response.status === 429
          ? "Limite temporário de uso atingido. Aguarde alguns instantes e tente novamente."
          : response.status === 502
            ? "O serviço de IA não está disponível com o modelo configurado."
            : typeof payload?.error === "string"
              ? payload.error
              : "Não foi possível tratar o produto com IA.";

    const error = new Error(message);
    (error as any).status = response.status;
    throw error;
  }

  if (!payload?.produto) {
    throw new Error("A API de IA não retornou o produto tratado.");
  }

  return payload as TratamentoProdutoResult;
}
