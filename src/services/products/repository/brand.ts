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

export async function getOrCreateBrandId(name: string): Promise<number> {
  const brand = normalizeName(name, "Sem marca");

  const { data: existing, error: selectError } = await supabase
    .from("marca")
    .select("id")
    .ilike("nome", brand)
    .maybeSingle<IdRow>();

  if (selectError) {
    throw new Error(errorMessage(selectError, "Falha ao buscar marca"));
  }

  if (existing) {
    return existing.id;
  }

  const { data: created, error: createError } = await supabase
    .from("marca")
    .insert({
      nome: brand,
      ativo: true,
    })
    .select("id")
    .single<IdRow>();

  if (createError || !created) {
    throw new Error(errorMessage(createError, "Falha ao criar marca"));
  }

  return created.id;
}
