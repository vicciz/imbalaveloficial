import { supabase } from "../../../supabaseClient";

import {
  adicionarImagem,
  excluirImagem,
  definirImagemPrincipal,
} from "./produtoImagem";

import { ImagemFormulario } from "@/src/components/Admin/common/types";

interface SalvarGaleriaProps {
  idProduto: number;
  imagens: ImagemFormulario[];
}

export async function salvarGaleriaProduto({
  idProduto,
  imagens,
}: SalvarGaleriaProps) {
  for (let index = 0; index < imagens.length; index++) {
    const imagem = imagens[index];

    // Imagem já existe no banco
    if (imagem.id) {

      if (imagem.principal) {
        await definirImagemPrincipal(
          idProduto,
          imagem.id
        );
      }

      continue;
    }

    // Imagem nova
    if (!imagem.file) continue;

    const extensao =
      imagem.file.name
        .split(".")
        .pop();

    const nomeArquivo =
      `${crypto.randomUUID()}.${extensao}`;

    const caminho =
      `${idProduto}/${nomeArquivo}`;

    const { error } =
      await supabase.storage
        .from("produtos")
        .upload(
          caminho,
          imagem.file
        );

    if (error) {
      throw error;
    }

    const { data } =
      supabase.storage
        .from("produtos")
        .getPublicUrl(
          caminho
        );

   await adicionarImagem(
    idProduto,
    caminho,
    index,
    imagem.principal,
    imagem.idValor ?? null
);
  }
}
