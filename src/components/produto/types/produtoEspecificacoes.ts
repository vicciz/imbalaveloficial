import { supabase } from '../../../../supabaseClient';

export interface ProdutoEspecificacao {
  id: number;
  id_produto: number;
  grupo: string;
  nome: string;
  valor: string;
  ordem: number;
}

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  return supabase;
}

function normalizeError(error: any) {
  if (!error) return null;
  let message = error.message ?? error.code ?? null;
  if (!message) {
    if (typeof error.toString === 'function' && error.toString() !== '[object Object]') {
      message = error.toString();
    } else {
      message = String(error);
    }
  }

  return {
    ...error,
    message,
  };
}

export async function listarEspecificacoesProduto(
  idProduto: number
): Promise<{
  data: ProdutoEspecificacao[] | null;
  error: any;
}> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from('produto_especificacao')
    .select('*')
    .eq('id_produto', idProduto)
    .order('ordem', { ascending: true });

  return {
    data: data ?? null,
    error: normalizeError(error),
  };
}
