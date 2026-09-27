import "server-only";

import { getSupabaseAdminClient } from "./adminSupabase";
import { supabaseErrorMessage } from "./supabaseError";

interface IdRow {
  id: number;
}

function normalizeName(name: string, fallback: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export async function getOrCreateCategoryId(name: string): Promise<number> {
  const category = normalizeName(name, "Sem categoria");
  const supabaseAdmin = getSupabaseAdminClient();

  const { data: existing, error: selectError } = await supabaseAdmin
    .from("categorias")
    .select("id")
    .ilike("nome", category)
    .maybeSingle<IdRow>();

  if (selectError) {
    throw new Error(supabaseErrorMessage(selectError, "Falha ao buscar categoria"));
  }

  if (existing) {
    return existing.id;
  }

  const { data: created, error: createError } = await supabaseAdmin
    .from("categorias")
    .insert({ nome: category })
    .select("id")
    .single<IdRow>();

  if (createError?.code === "23505") {
    const { data: concurrentCategory, error: concurrentLookupError } =
      await supabaseAdmin
        .from("categorias")
        .select("id")
        .ilike("nome", category)
        .maybeSingle<IdRow>();

    if (concurrentLookupError) {
      throw new Error(
        supabaseErrorMessage(concurrentLookupError, "Falha ao buscar categoria criada em paralelo")
      );
    }

    if (concurrentCategory) {
      return concurrentCategory.id;
    }
  }

  if (createError) {
    throw new Error(supabaseErrorMessage(createError, "Falha ao criar categoria"));
  }

  if (!created) {
    throw new Error("Falha ao criar categoria: Supabase não retornou o ID.");
  }

  return created.id;
}
