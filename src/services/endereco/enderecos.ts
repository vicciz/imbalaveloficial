import { supabase } from "../../../supabaseClient";

export type Endereco = {
  id: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  principal: boolean;
  id_usuario: string;
};

export async function listarEnderecos(
  userId: string
) {
  const { data, error } = await supabase
    .from("enderecos")
    .select("*")
    .eq("id_usuario", userId)
    .order("principal", {
      ascending: false,
    });

  return {
    data: (data as Endereco[]) ?? [],
    error,
  };
}

export async function buscarEndereco(
  id: number
) {
  const { data, error } = await supabase
    .from("enderecos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return {
    data: data as Endereco | null,
    error,
  };
}

export async function buscarEnderecoPrincipal(
  userId: string
) {
  const { data, error } = await supabase
    .from("enderecos")
    .select("*")
    .eq("id_usuario", userId)
    .eq("principal", true)
    .maybeSingle();

  return {
    data: data as Endereco | null,
    error,
  };
}

export async function criarEndereco(
  endereco: Omit<Endereco, "id">
) {
  return await supabase
    .from("enderecos")
    .insert(endereco)
    .select()
    .single();
}

export async function atualizarEndereco(
  id: number,
  endereco: Partial<Omit<Endereco, "id">>
) {
  return await supabase
    .from("enderecos")
    .update(endereco)
    .eq("id", id)
    .select()
    .single();
}

export async function excluirEndereco(
  id: number
) {
  const { error } = await supabase
    .from("enderecos")
    .delete()
    .eq("id", id);

  return {
    success: !error,
    error,
  };
}

export async function definirEnderecoPrincipal(
  userId: string,
  enderecoId: number
) {
  await supabase
    .from("enderecos")
    .update({
      principal: false,
    })
    .eq("id_usuario", userId);

  return await supabase
    .from("enderecos")
    .update({
      principal: true,
    })
    .eq("id", enderecoId)
    .eq("id_usuario", userId);
}