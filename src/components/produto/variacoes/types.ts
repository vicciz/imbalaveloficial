import type {
  Produto,
  ProdutoVariacao,
} from "@/src/components/produto/types/produtos";

import {
  ImagemFormulario,
} from "@/src/components/Admin/common/types";

export interface CardVariacaoProps {
  produto: Produto;

  variacao: ProdutoVariacao;

  imagens: ImagemFormulario[];

  setImagens: React.Dispatch<
    React.SetStateAction<ImagemFormulario[]>
  >;

  abrirCropper: (
    imagem: ImagemFormulario
  ) => void;
}