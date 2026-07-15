import { supabase } from "../../../supabaseClient";

export interface Fornecedor {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  site?: string | null;
}

// Criar fornecedor
export async function criarFornecedor(
  fornecedor: Omit<Fornecedor, "id">
) {
  const { data, error } = await supabase
    .from("fornecedores")
    .insert(fornecedor)
    .select()
    .single();

  return { data, error };
}

// Editar fornecedor
export async function editarFornecedor(
  id: number,
  fornecedor: Partial<Fornecedor>
) {
  const { data, error } = await supabase
    .from("fornecedores")
    .update(fornecedor)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

// Buscar fornecedor
export async function buscarFornecedor(
  id: number
) {
  const { data, error } = await supabase
    .from("fornecedores")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

// Listar fornecedores
export async function listarFornecedores() {
  const { data, error } = await supabase
    .from("fornecedores")
    .select("*")
    .order("nome");

  return { data, error };
}

// Excluir fornecedor
export async function excluirFornecedor(
  id: number
) {
  const { data, error } = await supabase
    .from("fornecedores")
    .delete()
    .eq("id", id);

  return { data, error };
}
