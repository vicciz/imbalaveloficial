import { supabase } from "@/supabaseClient";

export function obterUrlImagem(
  caminho: string
) {
  return supabase.storage
    .from("produtos")
    .getPublicUrl(caminho)
    .data.publicUrl;
}