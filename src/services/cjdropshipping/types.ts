export interface CjProdutoNormalizado {
  /** JSON original retornado pelo provedor */
  raw?: unknown;
  fonte?: string;
  idExterno: string;

  nome: string;

  descricao: string;

  link: string;

  rating: number;

  reviews: number;

  marca: string;

  fornecedor: string;

  categoria: string;

  imagens: {
    caminho: string;
    ordem: number;
    principal: boolean;
  }[];

  variacoes: {
    sku: string;

    fornecedorSku: string;

    preco: number;

    estoque: number;

    ativo: boolean;

    imagemPrincipal: string;

    opcoes: {
      tipo: string;
      valor: string;
    }[];
  }[];

  especificacoes: {
    grupo: string;
    nome: string;
    valor: string;
    ordem: number;
  }[];
}

export interface CjVariacaoNormalizada {
  sku: string;

  fornecedorSku: string;

  preco: number;

  estoque: number;

  ativo: boolean;

  imagemPrincipal: string;

  opcoes: {
    tipo: string;
    valor: string;
  }[];
}