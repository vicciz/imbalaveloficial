import { supabase } from "../../../supabaseClient";

export interface Endereco {
  id: number;
  cep?: string | null;
  logradouro: string;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade: string;
  estado: string;
  pais?: string | null;
  id_usuario?: number | null;
  principal?: boolean | null;
  created_at?: string | null;
}

// Criar endereço
export async function criarEndereco(
  endereco: Omit<Endereco, "id">
) {
  const { data, error } = await supabase
    .from("enderecos")
    .insert(endereco)
    .select()
    .single();

  return { data, error };
}

// Editar endereço
export async function editarEndereco(
  id: number,
  endereco: Partial<Endereco>
) {
  const { data, error } = await supabase
    .from("enderecos")
    .update(endereco)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

// Buscar endereço
export async function buscarEndereco(id: number) {
  const { data, error } = await supabase
    .from("enderecos")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

// Listar endereços
export async function listarEnderecos() {
  const { data, error } = await supabase
    .from("enderecos")
    .select("*")
    .order("cidade");

  return { data, error };
}

export async function buscarEnderecoPrincipalUsuario(idUsuario: number) {
  const { data, error } = await supabase
    .from("enderecos")
    .select("*")
    .eq("id_usuario", idUsuario)
    .eq("principal", true)
    .maybeSingle();

  return { data, error };
}

// Excluir endereço
export async function excluirEndereco(id: number) {
  const { data, error } = await supabase
    .from("enderecos")
    .delete()
    .eq("id", id);

  return { data, error };
}
