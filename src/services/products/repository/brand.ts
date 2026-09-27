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

export async function getOrCreateBrandId(name: string): Promise<number> {
  const brand = normalizeName(name, "Sem marca");
  const supabaseAdmin = getSupabaseAdminClient();

  const { data: existing, error: selectError } = await supabaseAdmin
    .from("marca")
    .select("id")
    .ilike("nome", brand)
    .maybeSingle<IdRow>();

  if (selectError) {
    throw new Error(supabaseErrorMessage(selectError, "Falha ao buscar marca"));
  }

  if (existing) {
    return existing.id;
  }

  const { data: created, error: createError } = await supabaseAdmin
    .from("marca")
    .insert({
      nome: brand,
      ativo: true,
    })
    .select("id")
    .single<IdRow>();

  if (createError) {
    throw new Error(supabaseErrorMessage(createError, "Falha ao criar marca"));
  }

  if (!created) {
    throw new Error("Falha ao criar marca: Supabase não retornou o ID.");
  }

  return created.id;
}
