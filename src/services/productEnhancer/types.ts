export interface ProdutoEnriquecido {
  titulo: string;

  categoria?: string;

  marca?: string;

  fornecedor?: string;

  descricaoOriginal: string;

  descricaoLimpa: string;

  especificacoes: Record<
    string,
    string
  >;

  variacoes: {
    sku: string;

    preco: number;

    estoque: number;

    opcoes: {
      tipo: string;
      valor: string;
    }[];
  }[];
}