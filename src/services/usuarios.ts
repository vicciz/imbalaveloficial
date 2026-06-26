import { supabase } from '@/supabaseClient';


export interface Usuario {
  id: string;
  nome: string;
  email: string;

  role: "admin" | "user";
}

type UsuarioCreate = Omit<Usuario, 'id'> & { senha?: string };
type UsuarioUpdate = Partial<Omit<Usuario, 'id'>> & { senha?: string };

export async function listarUsuarios(termo?: string): Promise<{ data: Usuario[] | null; error: any }> {
  let query = supabase.from('usuario').select('id,nome,email,role');

  if (termo) {
    const safeTermo = termo.replace(/[%_]/g, '');
    query = query.or(`nome.ilike.%${safeTermo}%,email.ilike.%${safeTermo}%`);
  }

  const { data, error } = await query;
  return { data: (data as Usuario[]) || null, error };
}

export async function criarUsuario(usuario: UsuarioCreate): Promise<{ data: Usuario | null; error: any }> {
  const { data, error } = await supabase
    .from('usuario')
    .insert(usuario)
    .select('id,nome,email,role')
    .single();

  return { data: (data as Usuario) || null, error };
}

export async function atualizarUsuario(id: number, usuario: UsuarioUpdate): Promise<{ data: Usuario | null; error: any }> {
  const { data, error } = await supabase
    .from('usuario')
    .update(usuario)
    .eq('id', id)
    .select('id,nome,email,role')
    .single();

  return { data: (data as Usuario) || null, error };
}

export async function excluirUsuario(id: number): Promise<{ data: Usuario | null; error: any }> {
  const { data, error } = await supabase
    .from('usuario')
    .delete()
    .eq('id', id)
    .select('id,nome,role')
    .single();

  return { data: (data as Usuario) || null, error };
}
export default function filtrarUsers(
  usuarios: Usuario[],
  campo: "nome",
  valor: string
): Usuario[] {
  if (!valor) return usuarios;

  return usuarios.filter(u =>
    u[campo].toLowerCase().includes(valor.toLowerCase())
  );
}