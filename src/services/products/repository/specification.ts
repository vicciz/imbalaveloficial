import "server-only";

import { getSupabaseAdminClient } from "./adminSupabase";
import { supabaseErrorMessage } from "./supabaseError";

import type { ProductSpecification } from "../types/ProductSpecification";

interface SpecificationPayload {
  id_produto: number;
  grupo: string;
  nome: string;
  valor: string;
  ordem: number;
}

export async function saveSpecifications(
  productId: number,
  specifications: ProductSpecification[]
): Promise<number> {
  const payload: SpecificationPayload[] = specifications.map((specification, index) => ({
    id_produto: productId,
    grupo: specification.group,
    nome: specification.name,
    valor: specification.value,
    ordem: specification.order ?? index,
  }));

  if (payload.length === 0) {
    return 0;
  }

  const { error } = await getSupabaseAdminClient().from("produto_especificacao").insert(payload);

  if (error) {
    throw new Error(supabaseErrorMessage(error, "Falha ao salvar especificacoes"));
  }

  return payload.length;
}
