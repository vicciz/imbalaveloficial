import { supabase } from "@/supabaseClient";
import type { HomeConfig } from "./types";

export async function obterConfigBanner() {
  return supabase
    .from("home_secoes")
    .select("*")
    .eq("tipo", "banner")
    .maybeSingle<HomeConfig>();
}

export async function atualizarConfigBanner(
  config: Partial<HomeConfig>
) {
  const {
    data,
    error,
  } = await obterConfigBanner();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  if (!data) {
    return {
      data: null,
      error: new Error(
        "Configuração do banner não encontrada."
      ),
    };
  }

  return supabase
    .from("home_secoes")
    .update(config)
    .eq("id", data.id)
    .select()
    .single<HomeConfig>();
}