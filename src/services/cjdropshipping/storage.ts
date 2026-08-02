import { randomUUID } from "crypto";

import { supabase } from "@/supabaseClient";

export async function importarImagemCJ(
  url: string
) {
  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Falha ao baixar imagem."
    );
  }

  const buffer =
    await response.arrayBuffer();

  const caminho =
    `${randomUUID()}.jpg`;

  const { error } =
    await supabase.storage
      .from("produtos")
      .upload(
        caminho,
        buffer,
        {
          contentType:
            response.headers.get(
              "content-type"
            ) ??
            "image/jpeg",
        }
      );

  if (error) {
    throw error;
  }

  return caminho;
}