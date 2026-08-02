export interface AIProductRequest {
  titulo: string;

  categoria?: string;

  marca?: string;

  fornecedor?: string;

  descricao: string;

  especificacoes: Record<string, string>;

  variacoes?: {
    sku: string;
    preco: number;
    estoque: number;
    opcoes: {
      tipo: string;
      valor: string;
    }[];
  }[];
}

export interface AIProductResponse {
  titulo: string;

  descricaoCurta: string;

  descricaoHtml: string;

  bullets: string[];

  seoTitle: string;

  seoDescription: string;

  slug: string;

  tags: string[];

  faq: {
    pergunta: string;
    resposta: string;
  }[];
}