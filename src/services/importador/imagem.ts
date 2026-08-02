import { supabase } from "@/supabaseClient";

import type {
  ImagemImportacao,
} from "./types";

export interface ImagemProdutoSalva {
  id: number;
  caminho: string;
  principal: boolean;
  ordem: number;
}

export async function importarImagemProduto(
  idProduto: number,
  imagem: ImagemImportacao,
  blob: Blob
): Promise<ImagemProdutoSalva> {

  const extensao =
    imagem.arquivo
      .split(".")
      .pop();

  const nomeFinal =
    `${Date.now()}.${extensao}`;

  const caminho =
    `${idProduto}/${nomeFinal}`;

  console.log("=== Upload ===");
  console.log({
    bucket: "produtos",
    caminho,
    arquivo: imagem.arquivo,
    tamanho: blob.size,
    tipo: blob.type,
  });

  const resultadoUpload =
    await supabase.storage

      .from("produtos")

      .upload(
        caminho,
        blob,
        {
          upsert: true,
        }
    );
  
  console.log("Resposta upload:");
  console.log(resultadoUpload);

  if (resultadoUpload.error) {

    console.error("Erro upload:");
    console.error(resultadoUpload.error);

    throw resultadoUpload.error;

  }
console.log("Valores que vão para o banco:");
console.log({
  principal: imagem.principal,
  ordem: imagem.ordem,
  tipoOrdem: typeof imagem.ordem,
});
  
  
  const resultadoBanco =
    await supabase

      .from("produto_imagem")

      .insert({

        id_produto: idProduto,

        caminho,

        principal: imagem.principal,

        ordem: imagem.ordem,

      })
      .select("id,caminho,principal,ordem")
      .single();
  

  console.log("Resposta banco:");
  console.log(resultadoBanco);

  if (resultadoBanco.error) {

    console.error("Erro banco:");
    console.error(resultadoBanco.error);

    throw resultadoBanco.error;

  }

  const imagemSalva = resultadoBanco.data ?? null;

  if (!imagemSalva) {
    throw new Error("Falha ao recuperar imagem salva");
  }

  return {
    id: imagemSalva.id,
    caminho: imagemSalva.caminho,
    principal: imagemSalva.principal,
    ordem: imagemSalva.ordem,
  };

}