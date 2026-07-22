export interface VitrineSecao {

  id: number;

  titulo: string;

  tipo: "categoria" | "colecao" | "produtos";

  referencia: string | null;

  quantidade: number;

  ordem: number;

  ativo: boolean;

  created_at?: string;

}