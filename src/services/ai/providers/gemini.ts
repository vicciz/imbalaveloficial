import { GoogleGenAI } from "@google/genai";

import type { AIProvider } from "../client";

import type {
  AIProductRequest,
  AIProductResponse,
} from "../types";

import { criarPromptProduto } from "../prompts/produto";

export class GeminiProvider
  implements AIProvider
{
  private client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  async gerarProduto(
    produto: AIProductRequest
  ): Promise<AIProductResponse> {
    const prompt =
      criarPromptProduto(produto);

    const response =
      await this.client.models.generateContent({
        model:
          process.env.GEMINI_MODEL ??
          "gemini-flash-latest",

        contents: prompt,
      });

    const texto =
      response.text?.trim() ?? "";

    if (!texto) {
      throw new Error(
        "Gemini retornou uma resposta vazia."
      );
    }

    console.log("===== GEMINI =====");
    console.log(texto);
    console.log("==================");

    try {
      return JSON.parse(
        this.extrairJson(texto)
      ) as AIProductResponse;

    } catch (error) {

      throw new Error(
        `Falha ao interpretar resposta do Gemini.\n\n${texto}`
      );

    }
  }

  private extrairJson(
    texto: string
  ): string {

    const markdown =
      texto.match(
        /```(?:json)?\s*([\s\S]*?)```/i
      );

    if (markdown) {
      return markdown[1].trim();
    }

    const inicio =
      texto.indexOf("{");

    const fim =
      texto.lastIndexOf("}");

    if (
      inicio !== -1 &&
      fim !== -1
    ) {
      return texto.slice(
        inicio,
        fim + 1
      );
    }

    return texto;
  }
}