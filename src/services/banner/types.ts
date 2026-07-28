export interface Banner {
  id: string;
  titulo: string;
  subtitulo: string | null;
  imagem: string;
  botao: string | null;
  link: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
}