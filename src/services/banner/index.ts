import { supabase } from "@/supabaseClient";
import type { Banner } from "./types";

const TABLE = "banners";

export async function listarBanners() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("ordem", { ascending: true });

  return { data, error };
}

export async function buscarBanner(id: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

export async function criarBanner(
  banner: Omit<Banner, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(banner)
    .select()
    .single();

  return { data, error };
}

export async function atualizarBanner(
  id: number,
  banner: Partial<Banner>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(banner)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function excluirBanner(id: number) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  return { error };
}

export async function alterarStatus(
  id: number,
  ativo: boolean
) {
  const { error } = await supabase
    .from(TABLE)
    .update({ ativo })
    .eq("id", id);

  return { error };
}

export async function alterarOrdem(
  id: number,
  ordem: number
) {
  const { error } = await supabase
    .from(TABLE)
    .update({ ordem })
    .eq("id", id);

  return { error };
}

