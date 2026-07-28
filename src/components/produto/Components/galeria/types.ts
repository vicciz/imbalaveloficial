export interface ImagemGaleria {
  id?: number;

  file?: File;

  url: string;

  caminho?: string;

  principal: boolean;

  ordem: number;

  idValor?: number | null;
}