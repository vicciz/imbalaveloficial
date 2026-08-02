import { supabase } from "@/supabaseClient";

interface IdRow {
  id: number;
}

function normalizeName(name: string, fallback: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function errorMessage(error: unknown, context: string): string {
  if (error instanceof Error) {
    return `${context}: ${error.message}`;
  }

  return `${context}: Erro desconhecido`;
}

export async function getOrCreateCategoryId(name: string): Promise<number> {
  const category = normalizeName(name, "Sem categoria");

  const { data: existing, error: selectError } = await supabase
    .from("categorias")
    .select("id")
    .ilike("nome", category)
    .maybeSingle<IdRow>();

  if (selectError) {
    throw new Error(errorMessage(selectError, "Falha ao buscar categoria"));
  }

  if (existing) {
    return existing.id;
  }

  const { data: created, error: createError } = await supabase
    .from("categorias")
    .insert({ nome: category })
    .select("id")
    .single<IdRow>();

  if (createError || !created) {
    throw new Error(errorMessage(createError, "Falha ao criar categoria"));
  }

  return created.id;
}
