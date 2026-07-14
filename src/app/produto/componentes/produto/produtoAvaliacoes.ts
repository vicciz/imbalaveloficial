import { supabase } from "@/supabaseClient";

export interface ProdutoAvaliacao {
  id?: number;
  id_produto: number;
  id_usuario: string;
  nota: number;
  comentario: string;
  criado_em?: string;
}

function ensureSupabase() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  return supabase;
}

export async function listarAvaliacoes(
  idProduto: number
) {
  const client = ensureSupabase();

  return await client
    .from("produto_avaliacao")
    .select("*")
    .eq("id_produto", idProduto)
    .order("criado_em", {
      ascending: false,
    });
}

export async function cadastrarAvaliacao(
  avaliacao: ProdutoAvaliacao
) {
  const client = ensureSupabase();

  return await client
    .from("produto_avaliacao")
    .insert(avaliacao)
    .select()
    .single();
}

export async function editarAvaliacao(
  id: number,
  avaliacao: Partial<ProdutoAvaliacao>
) {
  const client = ensureSupabase();

  return await client
    .from("produto_avaliacao")
    .update(avaliacao)
    .eq("id", id)
    .select()
    .single();
}

export async function excluirAvaliacao(
  id: number
) {
  const client = ensureSupabase();

  return await client
    .from("produto_avaliacao")
    .delete()
    .eq("id", id);
}