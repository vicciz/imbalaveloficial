import { supabase } from '@/supabaseClient';

export interface ProdutoAvaliacao {
  id?: number;
  id_produto: number;
  id_usuario: string;
  nota: number;
  comentario: string;
  criado_em?: string;
  atualizado_em?: string;
  usuario?: {
    nome: string;
    email?: string;
  };
}

interface AvaliacaoComUsuario extends ProdutoAvaliacao {
  usuario?: {
    nome: string;
    email?: string;
  };
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

/**
 * Buscar dados do usuário na tabela usuario
 */
async function buscarDadosUsuario(idUsuario: string): Promise<{ nome: string; email?: string }> {
  const client = ensureSupabase();

  try {
    const { data } = await client
      .from('usuario')
      .select('nome, email')
      .eq('user_id', idUsuario)
      .single();

    if (data) {
      return { nome: data.nome, email: data.email };
    }
  } catch (err) {
    // Silenciosamente falha se não encontrar
  }

  return { nome: 'Usuário', email: undefined };
}

/**
 * Enriquecer avaliações com dados do usuário
 */
async function enriquecerComDadosUsuario(
  avaliacoes: ProdutoAvaliacao[]
): Promise<AvaliacaoComUsuario[]> {
  const usuariosMap = new Map<string, { nome: string; email?: string }>();

  // Buscar dados únicos de usuários
  const idsUsuariosUnicos = [...new Set(avaliacoes.map((av) => av.id_usuario))];

  for (const idUsuario of idsUsuariosUnicos) {
    const dados = await buscarDadosUsuario(idUsuario);
    usuariosMap.set(idUsuario, dados);
  }

  // Mapear dados aos avaliacões
  return avaliacoes.map((av) => ({
    ...av,
    usuario: usuariosMap.get(av.id_usuario) || { nome: 'Usuário', email: undefined },
  }));
}

/**
 * Listar todas as avaliações de um produto com dados do usuário
 */
export async function listarAvaliacoesProduto(
  idProduto: number
): Promise<{ data: AvaliacaoComUsuario[] | null; error: any }> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from('produto_avaliacao')
    .select('*')
    .eq('id_produto', idProduto)
    .order('criado_em', { ascending: false });

  if (error) {
    return {
      data: null,
      error: normalizeError(error),
    };
  }

  if (!data || data.length === 0) {
    return {
      data: [],
      error: null,
    };
  }

  // Enriquecer com dados do usuário
  const avaliacoesEnriquecidas = await enriquecerComDadosUsuario(data);

  return {
    data: avaliacoesEnriquecidas,
    error: null,
  };
}

/**
 * Buscar avaliação específica do usuário para um produto
 */
export async function buscarAvaliacaoUsuario(
  idProduto: number,
  idUsuario: string
): Promise<{ data: ProdutoAvaliacao | null; error: any }> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from('produto_avaliacao')
    .select('*')
    .eq('id_produto', idProduto)
    .eq('id_usuario', idUsuario)
    .single();

  return {
    data: data ?? null,
    error: normalizeError(error),
  };
}

/**
 * Cadastrar nova avaliação
 */
export async function cadastrarAvaliacao(
  avaliacao: Omit<ProdutoAvaliacao, 'id' | 'criado_em'>
): Promise<{ data: ProdutoAvaliacao | null; error: any }> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from('produto_avaliacao')
    .insert(avaliacao)
    .select()
    .single();

  return {
    data: data ?? null,
    error: normalizeError(error),
  };
}

/**
 * Atualizar avaliação existente
 */
export async function atualizarAvaliacao(
  id: number,
  avaliacao: Partial<Omit<ProdutoAvaliacao, 'id' | 'id_produto' | 'id_usuario' | 'criado_em'>>
): Promise<{ data: ProdutoAvaliacao | null; error: any }> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from('produto_avaliacao')
    .update(avaliacao)
    .eq('id', id)
    .select()
    .single();

  return {
    data: data ?? null,
    error: normalizeError(error),
  };
}

/**
 * Excluir avaliação
 */
export async function excluirAvaliacao(
  id: number
): Promise<{ error: any }> {
  const client = ensureSupabase();

  const { error } = await client
    .from('produto_avaliacao')
    .delete()
    .eq('id', id);

  return {
    error: normalizeError(error),
  };
}

/**
 * Calcular estatísticas de avaliações
 */
export async function calcularEstatisticasAvaliacoes(
  idProduto: number
): Promise<{ rating: number; reviews: number }> {
  const { data, error } = await listarAvaliacoesProduto(idProduto);

  if (error || !data || data.length === 0) {
    return { rating: 0, reviews: 0 };
  }

  const somaNotas = data.reduce((acc, av) => acc + av.nota, 0);
  const mediaNotas = somaNotas / data.length;

  return {
    rating: Math.round(mediaNotas * 10) / 10,
    reviews: data.length,
  };
}
