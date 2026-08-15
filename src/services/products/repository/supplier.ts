import { supabase } from "@/supabaseClient";

interface IdRow {
  id: number;
}

interface PlatformInput {
  key: string;
  name: string;
}

export interface SupplierInput {
  name: string;
  platformKey?: string;
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

async function getOrCreatePlatformId(input: PlatformInput): Promise<number> {
  const key = input.key.trim().toLowerCase();
  const name = normalizeName(input.name, key);

  const { data: existing, error: selectError } = await supabase
    .from("plataformas_fornecedor")
    .select("id")
    .ilike("nome", name)
    .maybeSingle<IdRow>();

  if (selectError) {
    throw new Error(errorMessage(selectError, "Falha ao buscar plataforma do fornecedor"));
  }

  if (existing) {
    return existing.id;
  }

  const { data: created, error: createError } = await supabase
    .from("plataformas_fornecedor")
    .insert({
      nome: name,
      descricao: `Plataforma de origem: ${name}`,
      tipo: key,
      site: key === "cj" ? "https://www.cjdropshipping.com" : null,
      ativo: true,
    })
    .select("id")
    .single<IdRow>();

  if (createError || !created) {
    throw new Error(errorMessage(createError, "Falha ao criar plataforma do fornecedor"));
  }

  return created.id;
}

export async function getOrCreateSupplierId(nameOrInput: string | SupplierInput): Promise<number> {
  const input: SupplierInput = typeof nameOrInput === "string" ? { name: nameOrInput } : nameOrInput;
  const supplier = normalizeName(input.name, "Sem fornecedor");
  const platform = input.platformKey
    ? { key: input.platformKey, name: input.platformKey === "cj" ? "CJ Dropshipping" : input.platformKey }
    : null;

  const platformId = platform ? await getOrCreatePlatformId(platform) : null;

  const { data: existing, error: selectError } = await supabase
    .from("fornecedores")
    .select("id,plataforma_id")
    .ilike("nome", supplier)
    .maybeSingle<IdRow & { plataforma_id?: number | null }>();

  if (selectError) {
    throw new Error(errorMessage(selectError, "Falha ao buscar fornecedor"));
  }

  if (existing) {
    if (platformId && !existing.plataforma_id) {
      const { error: updateError } = await supabase
        .from("fornecedores")
        .update({ plataforma_id: platformId })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(errorMessage(updateError, "Falha ao vincular plataforma ao fornecedor"));
      }
    }

    return existing.id;
  }

  const { data: created, error: createError } = await supabase
    .from("fornecedores")
    .insert({
      nome: supplier,
      plataforma_id: platformId,
    })
    .select("id")
    .single<IdRow>();

  if (createError || !created) {
    throw new Error(errorMessage(createError, "Falha ao criar fornecedor"));
  }

  return created.id;
}
