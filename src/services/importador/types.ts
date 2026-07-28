export interface ProdutoImportacao {

  nome: string;

  descricao: string;

  detalhes: string;

  categoria: string;

  marca: string;

  fornecedor: string;

  preco: number;

  estoque: number;

  destaque: boolean;

  oculto?: boolean;

  link?: string;

}

export interface ImagemImportacao {

  produto: string;

  arquivo: string;

  principal: boolean;

  ordem: number;

}

export interface EspecificacaoImportacao {

  produto: string;

  grupo: string;

  nome: string;

  valor: string;

  ordem?: number;

}

export interface VariacaoImportacao {

  produto: string;

  tipo: string;

  valor: string;

  preco: number;

  estoque: number;

}