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

export async function getOrCreateSupplierId(name: string): Promise<number> {
  const supplier = normalizeName(name, "Sem fornecedor");

  const { data: existing, error: selectError } = await supabase
    .from("fornecedores")
    .select("id")
    .ilike("nome", supplier)
    .maybeSingle<IdRow>();

  if (selectError) {
    throw new Error(errorMessage(selectError, "Falha ao buscar fornecedor"));
  }

  if (existing) {
    return existing.id;
  }

  const { data: created, error: createError } = await supabase
    .from("fornecedores")
    .insert({ nome: supplier })
    .select("id")
    .single<IdRow>();

  if (createError || !created) {
    throw new Error(errorMessage(createError, "Falha ao criar fornecedor"));
  }

  return created.id;
}
