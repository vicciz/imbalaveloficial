import { supabase } from '@/supabaseClient';
export interface Usuario {
  id: number;
  user_id: string;

  nome: string;
  email?: string;
  telefone?: string;

  role: "admin" | "user";

  createdAt?: string;
  created_at?: string;
}
type UsuarioCreate = Omit<Usuario, "id">;

type UsuarioUpdate = Partial<Omit<Usuario, "id">>;

export async function listarUsuarios(termo?: string) {
  let query = supabase
    .from("usuario")
    .select("*");

  if (termo) {
    query = query.ilike("nome", `%${termo}%`);
  }

  const { data, error } = await query.order("id", {
    ascending: true,
  });

  console.log("USUARIOS:", data);
  console.log("ERRO:", error);

  return {
    data,
    error,
  };
}

export async function criarUsuario(usuario: UsuarioCreate) {
  return await supabase
    .from("usuario")
    .insert(usuario)
    .select()
    .single();
}

export async function atualizarUsuario(
  id: number,
  usuario: UsuarioUpdate
) {
  return await supabase
    .from("usuario")
    .update(usuario)
    .eq("id", id)
    .select()
    .single();
}

export async function excluirUsuario(
  id: number
) {
  return await supabase
    .from("usuario")
    .delete()
    .eq("id", id);
}

export function filtrarUsers(
  usuarios: Usuario[],
  valor: string
) {
  if (!valor) return usuarios;

  return usuarios.filter((u) =>
    u.nome
      .toLowerCase()
      .includes(valor.toLowerCase())
  );
}

