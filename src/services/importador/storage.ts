import { supabase } from "@/supabaseClient";

export async function uploadImagemProduto(

  idProduto: number,

  nomeArquivo: string,

  blob: Blob

) {

  const extensao =
    nomeArquivo
      .split(".")
      .pop();

  const nomeFinal =
    `${Date.now()}.${extensao}`;

  const caminho =
    `${idProduto}/${nomeFinal}`;

  const { error } =
    await supabase.storage

      .from("produtos")

      .upload(
        caminho,
        blob,
        {
          upsert: true,
        }
      );

  if (error) {

    throw error;

  }

  return caminho;

}