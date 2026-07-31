export interface ProdutoImportacao {

  nome: string;

  descricao: string;

  detalhes: string;

  categoria: string;

  marca: string;

  fornecedor: string;

  destaque: boolean;

  oculto?: boolean;

  link?: string;

}

export interface ImagemImportacao {
  produto: string;
  valor: string; // NOVO
  arquivo: string;
  ordem: number;
  principal: boolean;
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

  sku?: string;

  imagem_principal?: string;

}