import { supabase } from "../../../../supabaseClient";

import {
  adicionarImagem,
  excluirImagem,
  definirImagemPrincipal,
} from "@/src/components/produto/types/produtoImagem";

import { ImagemFormulario } from "@/src/components/Admin/common/types";

interface SalvarGaleriaProps {
  idProduto: number;
  imagens: ImagemFormulario[];
}

export async function salvarGaleriaProduto({
  idProduto,
  imagens,
}: SalvarGaleriaProps) {
  for (let ordem = 0; ordem < imagens.length; ordem++) {
    const imagem = imagens[ordem];

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
    ordem,
    imagem.principal,
    imagem.idValor ?? null
);
  }
}
