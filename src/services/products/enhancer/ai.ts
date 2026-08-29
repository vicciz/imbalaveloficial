import { GoogleGenAI } from "@google/genai";

import type { Product } from "../types/Product";

export interface AIProvider {
  readonly name: string;
  generateProduct(product: Product): Promise<Partial<Product>>;
}

interface AIResponsePayload {
  title?: string;
  shortDescription?: string;
  description?: string;
  bullets?: string[];
  seo?: {
    title?: string;
    description?: string;
    slug?: string;
    tags?: string[];
  };
}

interface RetryDecision {
  retry: boolean;
  fallbackModel: boolean;
  status?: number;
  reason: string;
}

type JsonRecord = Record<string, unknown>;

const GEMINI_RETRY_DELAYS_MS = [0, 1000, 3000] as const;

function logAIStage(message: string, details?: unknown): void {
  console.log(message);

  if (details !== undefined) {
    console.log(details);
  }
}

function buildPrompt(product: Product): string {
  return `
Você é um redator especialista em e-commerce brasileiro, com mais de 15 anos de experiência em descrição de produtos para grandes lojas virtuais.

Você domina SEO, copywriting, UX e conversão.

OBJETIVO:
Transformar qualquer produto importado em uma página pronta para venda.
A descrição final deve parecer escrita por um redator profissional.
Nunca deve parecer tradução automática.

REGRAS OBRIGATORIAS:
- NUNCA responder em ingles.
- NUNCA deixar palavras em ingles.
- NUNCA copiar frases do fornecedor.
- NUNCA copiar HTML do fornecedor.
- NUNCA inventar informacoes.
- NUNCA inventar materiais.
- NUNCA inventar medidas.
- NUNCA inventar potencia.
- NUNCA inventar compatibilidades.
- NUNCA inventar certificacoes.
- NUNCA inventar garantia.
- NUNCA inventar conteudo da embalagem.
- NUNCA utilizar Markdown.
- NUNCA utilizar CSS.
- NUNCA utilizar emojis.
- NUNCA utilizar linguagem robotica.

TRADUCAO:
- Todo conteudo recebido deve ser traduzido para portugues do Brasil.
- A traducao deve ser natural.
- Nao fazer traducao literal.
- Traduzir termos tecnicos apenas quando fizer sentido.

LIMPEZA:
Remover completamente qualquer:
- HTML antigo.
- tags quebradas.
- scripts.
- styles.
- imagens.
- iframes.
- tabelas antigas.
- texto repetido.
- espacos extras.
- caracteres invalidos.

REESCRITA:
- A descricao deve ser completamente reescrita.
- Nao apenas reorganizar.
- Escrever um texto novo, natural e persuasivo, focado em venda.

TITULO:
- Criar novo titulo com no maximo 70 caracteres.
- SEO e natural.
- Sem excesso de palavras-chave.

DESCRICAO CURTA:
- Criar resumo entre 140 e 220 caracteres.

DESCRICAO HTML:
- Gerar HTML limpo, sem CSS.
- Usar exatamente as secoes abaixo quando houver dados suficientes.
- Se nao houver dados suficientes para uma secao, omitir a secao.

Estrutura permitida:
<h2>Visao Geral</h2>
<p>...</p>

<h2>Principais Beneficios</h2>
<ul>
<li>...</li>
</ul>

<h2>Caracteristicas</h2>
<ul>
<li>...</li>
</ul>

<h2>Especificacoes Tecnicas</h2>
<table>
<tr>
<td>Campo</td>
<td>Valor</td>
</tr>
</table>

<h2>Indicacao de Uso</h2>
<p>...</p>

<h2>Conteudo da Embalagem</h2>
<ul>
<li>...</li>
</ul>

ESPECIFICACOES:
- Todas as especificacoes tecnicas devem aparecer na tabela.
- Nunca repetir especificacoes em outras secoes.

SEO:
Gerar:
- seoTitle: ate 60 caracteres.
- seoDescription: entre 140 e 160 caracteres.
- slug: amigavel.
- tags: entre 8 e 15 palavras-chave relevantes.

BULLETS:
- Gerar entre 5 e 8 bullets.
- Cada bullet deve ter no maximo 90 caracteres.

SAIDA:
- Retornar SOMENTE JSON valido.
- Nenhuma explicacao.
- Nenhum comentario.
- Nenhum markdown.

ESTRUTURA OBRIGATORIA DA RESPOSTA:
{
  "title": "",
  "shortDescription": "",
  "description": "",
  "bullets": [],
  "seo": {
    "title": "",
    "description": "",
    "slug": "",
    "tags": []
  }
}

QUALIDADE ANTES DE RESPONDER:
Verifique e corrija internamente:
- texto em ingles,
- HTML quebrado,
- informacao inventada,
- texto repetido,
- SEO fraco,
- frases roboticas.

Use exclusivamente os dados abaixo como fonte da verdade:
${JSON.stringify(product, null, 2)}
  `;
}

function extractJson(text: string): string {
  const markdown = text.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (markdown?.[1]) {
    return markdown[1].trim();
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start >= 0 && end >= start) {
    return text.slice(start, end + 1);
  }

  return text;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractErrorDetails(error: unknown): { status?: number; message: string } {
  if (error instanceof Error) {
    const errorWithStatus = error as Error & { status?: number; code?: number | string };

    const status =
      typeof errorWithStatus.status === "number"
        ? errorWithStatus.status
        : typeof errorWithStatus.code === "number"
          ? errorWithStatus.code
          : undefined;

    return {
      status,
      message: error.message,
    };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  return { message: "Erro desconhecido" };
}

function isRetryableStatus(status: number | undefined): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function includesIgnoreCase(value: string, term: string): boolean {
  return value.toLowerCase().includes(term.toLowerCase());
}

function shouldRetry(error: unknown): RetryDecision {
  const { status, message } = extractErrorDetails(error);

  if (isRetryableStatus(status)) {
    return {
      retry: true,
      fallbackModel: true,
      status,
      reason: `HTTP ${status}`,
    };
  }

  if (status === 404) {
    return {
      retry: false,
      fallbackModel: true,
      status,
      reason: "HTTP 404",
    };
  }

  if ([400, 401, 403].includes(status ?? -1)) {
    return {
      retry: false,
      fallbackModel: false,
      status,
      reason: `HTTP ${status}`,
    };
  }

  if (
    includesIgnoreCase(message, "timeout") ||
    includesIgnoreCase(message, "network") ||
    includesIgnoreCase(message, "fetch failed") ||
    includesIgnoreCase(message, "503") ||
    includesIgnoreCase(message, "502") ||
    includesIgnoreCase(message, "504") ||
    includesIgnoreCase(message, "500") ||
    includesIgnoreCase(message, "429")
  ) {
    return {
      retry: true,
      fallbackModel: includesIgnoreCase(message, "503") || includesIgnoreCase(message, "404"),
      status,
      reason: message,
    };
  }

  if (
    includesIgnoreCase(message, "401") ||
    includesIgnoreCase(message, "403") ||
    includesIgnoreCase(message, "authentication") ||
    includesIgnoreCase(message, "unauthorized") ||
    includesIgnoreCase(message, "forbidden") ||
    includesIgnoreCase(message, "parse") ||
    includesIgnoreCase(message, "json") ||
    includesIgnoreCase(message, "prompt") ||
    includesIgnoreCase(message, "400")
  ) {
    return {
      retry: false,
      fallbackModel: false,
      status,
      reason: message,
    };
  }

  return {
    retry: false,
    fallbackModel: false,
    status,
    reason: message,
  };
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function uniqueModels(client: GoogleGenAI): Promise<string[]> {
  const configured = [
    process.env.GEMINI_MODEL_PRIMARY,
    process.env.GEMINI_MODEL_SECONDARY,
    process.env.GEMINI_MODEL_TERTIARY,
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
  ]
    .filter((model): model is string => typeof model === "string" && model.trim().length > 0)
    .map((model) => model.trim().replace(/^models\//, ""));

  try {
    const pager = await client.models.list({ pageSize: 100 });
    const available: string[] = [];

    for await (const model of pager) {
      const name = typeof model.name === "string"
        ? model.name.replace(/^models\//, "").trim()
        : "";

      const actions = Array.isArray((model as any).supportedActions)
        ? (model as any).supportedActions
        : [];

      if (name && actions.includes("generateContent")) {
        available.push(name);
      }
    }

    const availableSet = new Set(available);
    const preferred = configured.filter((model, index, list) =>
      availableSet.has(model) && list.indexOf(model) === index
    );

    const fallback = available
      .filter((model) =>
        /(?:flash|pro|gemma)/i.test(model) &&
        !preferred.includes(model) &&
        !/(?:embedding|tts|image|audio|live|robotics)/i.test(model)
      )
      .sort((a, b) => {
        const rank = (name: string) => {
          if (/flash/i.test(name)) return 0;
          if (/pro/i.test(name)) return 1;
          return 2;
        };
        return rank(a) - rank(b);
      });

    const models = [...preferred, ...fallback];

    if (models.length > 0) {
      logAIStage(`Modelos Gemini disponíveis para esta chave: ${models.join(", ")}`);
      return models.slice(0, 5);
    }
  } catch (error) {
    logAIStage("Não foi possível listar os modelos Gemini; usando fallback configurado.", extractErrorDetails(error).message);
  }

  return configured.filter((model, index, list) => list.indexOf(model) === index).slice(0, 5);
}

function mergeAIProduct(product: Product, parsed: AIResponsePayload): Partial<Product> {
  return {
    title: parsed.title,
    shortDescription: parsed.shortDescription,
    description: parsed.description,
    bullets: parsed.bullets,
    seo: {
      ...product.seo,
      title: parsed.seo?.title ?? product.seo.title,
      description: parsed.seo?.description ?? product.seo.description,
      slug: parsed.seo?.slug ?? product.seo.slug,
      tags: parsed.seo?.tags ?? product.seo.tags,
    },
  };
}

function parseAIResponse(content: string): AIResponsePayload {
  const extracted = extractJson(content).trim();

  if (!extracted || (!extracted.startsWith("{") && !extracted.startsWith("["))) {
    logAIStage("Falha ao extrair JSON válido da resposta da IA.");
    return {};
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(extracted);
  } catch (error) {
    logAIStage("Falha ao fazer parse do JSON da IA.", extractErrorDetails(error).message);
    return {};
  }

  if (!isObject(parsed)) {
    return {};
  }

  const seoValue = isObject(parsed.seo) ? parsed.seo : undefined;

  return {
    title: typeof parsed.title === "string" ? parsed.title : undefined,
    shortDescription:
      typeof parsed.shortDescription === "string" ? parsed.shortDescription : undefined,
    description: typeof parsed.description === "string" ? parsed.description : undefined,
    bullets: Array.isArray(parsed.bullets)
      ? parsed.bullets
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
      : undefined,
    seo:
      seoValue === undefined
        ? undefined
        : {
            title: typeof seoValue.title === "string" ? seoValue.title : undefined,
            description:
              typeof seoValue.description === "string" ? seoValue.description : undefined,
            slug: typeof seoValue.slug === "string" ? seoValue.slug : undefined,
            tags: Array.isArray(seoValue.tags)
              ? seoValue.tags.filter((value): value is string => typeof value === "string")
              : undefined,
          },
  };
}

export class GeminiProvider implements AIProvider {
  readonly name = "Gemini";

  private readonly client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  async generateProduct(product: Product): Promise<Partial<Product>> {
    const prompt = buildPrompt(product);
    const models = await uniqueModels(this.client);

    logAIStage("Provider: Gemini");
    logAIStage("Prompt enviado");

    for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
      const model = models[modelIndex];

      for (let attemptIndex = 0; attemptIndex < GEMINI_RETRY_DELAYS_MS.length; attemptIndex += 1) {
        const delay = GEMINI_RETRY_DELAYS_MS[attemptIndex];

        if (delay > 0) {
          await sleep(delay);
        }

        try {
          logAIStage(`Modelo: ${model}`);
          logAIStage(`Tentativa: ${attemptIndex + 1}`);

          const response = await this.client.models.generateContent({
            model,
            contents: prompt,
          });

          const text = response.text?.trim() ?? "";

          logAIStage("Resposta recebida");
          logAIStage(text || "Resposta vazia");
          logAIStage(`Modelo utilizado: ${model}`);

          const parsed = parseAIResponse(text);

          if (Object.keys(parsed as JsonRecord).length === 0) {
            logAIStage("Resposta da IA sem JSON utilizável. Continuando sem enriquecimento.");
            return {};
          }

          logAIStage("Produto enriquecido");
          return mergeAIProduct(product, parsed);
        } catch (error) {
          const decision = shouldRetry(error);
          const details = extractErrorDetails(error);

          logAIStage("Erro:");
          logAIStage(details.message);

          const hasNextModel = modelIndex < models.length - 1;

          if (decision.fallbackModel && hasNextModel) {
            logAIStage(`Fallback para próximo modelo após ${decision.reason}.`);
            break;
          }

          const hasNextAttempt = attemptIndex < GEMINI_RETRY_DELAYS_MS.length - 1;

          if (decision.retry && hasNextAttempt) {
            logAIStage(`Retry automático após ${decision.reason}.`);
            continue;
          }

          logAIStage("Continuando pipeline sem enriquecimento.");
          return {};
        }
      }
    }

    logAIStage("Continuando pipeline sem enriquecimento.");
    return {};
  }
}

export class OpenAIProvider implements AIProvider {
  readonly name = "OpenAI";

  private readonly model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  async generateProduct(product: Product): Promise<Partial<Product>> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {};
    }

    logAIStage("Provider: OpenAI");
    logAIStage("Prompt enviado");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Retorne apenas JSON válido com melhorias de produto para ecommerce.",
          },
          {
            role: "user",
            content: buildPrompt(product),
          },
        ],
      }),
    });

    if (!response.ok) {
      logAIStage("Erro:");
      logAIStage(`HTTP ${response.status}`);
      return {};
    }

    const payload: unknown = await response.json();

    if (!isObject(payload)) {
      return {};
    }

    const choices = payload.choices;
    if (!Array.isArray(choices) || choices.length === 0) {
      return {};
    }

    const first = choices[0];
    if (!isObject(first) || !isObject(first.message)) {
      return {};
    }

    const content = first.message.content;
    if (typeof content !== "string") {
      return {};
    }

    logAIStage("Resposta recebida");
    logAIStage(content);
    logAIStage(`Modelo utilizado: ${this.model}`);

    const parsed = parseAIResponse(content);

    if (Object.keys(parsed as JsonRecord).length === 0) {
      logAIStage("Resposta da IA sem JSON utilizável. Continuando sem enriquecimento.");
      return {};
    }

    logAIStage("Produto enriquecido");
    return mergeAIProduct(product, parsed);
  }
}

class FallbackAIProvider implements AIProvider {
  readonly name = "Fallback AI";

  constructor(private readonly providers: AIProvider[]) {}

  async generateProduct(product: Product): Promise<Partial<Product>> {
    let lastError: unknown;

    for (const provider of this.providers) {
      try {
        logAIStage(`Provider de IA: ${provider.name}`);
        const result = await provider.generateProduct(product);

        if (Object.keys(result as JsonRecord).length > 0) {
          return result;
        }
      } catch (error) {
        lastError = error;
        logAIStage(`Provider ${provider.name} indisponível. Tentando próximo provider.`);
      }
    }

    if (lastError) {
      throw lastError;
    }

    return {};
  }
}

export function createAIProvider(): AIProvider | null {
  const configured = (process.env.PRODUCT_AI_PROVIDER ?? "auto").toLowerCase();
  const providers: AIProvider[] = [];

  if (configured !== "openai" && process.env.GEMINI_API_KEY) {
    providers.push(new GeminiProvider());
  }

  if (configured !== "gemini" && process.env.OPENAI_API_KEY) {
    providers.push(new OpenAIProvider());
  }

  if (providers.length === 0) {
    return null;
  }

  return providers.length === 1
    ? providers[0]
    : new FallbackAIProvider(providers);
}
