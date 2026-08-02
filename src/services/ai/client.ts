import type {
  AIProductRequest,
  AIProductResponse,
} from "./types";

export interface AIProvider {
  gerarProduto(
    produto: AIProductRequest
  ): Promise<AIProductResponse>;
}

let provider: AIProvider;

export function setAIProvider(
  ai: AIProvider
) {
  provider = ai;
}

export function getAIProvider() {

  if (!provider) {
    throw new Error(
      "Nenhum provider de IA configurado."
    );
  }

  return provider;

}