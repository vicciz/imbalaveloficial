import { supabase } from "../../../supabaseClient";

export async function registrar(
  nome: string,
  email: string,
  senha: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        nome,
      },
    },
  });

  return { data, error };
}

export async function login(
  email: string,
  senha: string
) {
  // Faz login no Supabase Auth
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

  if (error || !data.user) {
    return { data: null, error };
  }

  // Busca o usuário na sua tabela
  const {
    data: usuario,
    error: usuarioError,
  } = await supabase
    .from("usuario")
    .select("*")
    .eq("user_id", data.user.id)
    .single();

  if (usuarioError) {
    return {
      data: null,
      error: usuarioError,
    };
  }

  return {
    data: usuario,
    error: null,
  };
}

export async function logout() {
  const { error } =
    await supabase.auth.signOut();

  return { error };
}
