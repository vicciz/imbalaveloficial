import { supabase } from "@/supabaseClient";

export async function uploadBanner(
  file: File
) {
  const extensao =
    file.name.split(".").pop();

  const nome =
    `${crypto.randomUUID()}.${extensao}`;

  const caminho = `home/${nome}`;

  const { error } =
    await supabase.storage
      .from("banners")
      .upload(caminho, file);

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("banners")
    .getPublicUrl(caminho);

  return publicUrl;
}