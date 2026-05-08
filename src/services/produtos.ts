// services/produtos.ts – wrapper around Supabase table `produtos`
import { supabase } from '../../supabaseClient';

export interface Produto {
  id: number;
  nome: string;
  preco: string | number;
  link?: string | null;
  rating?: number | null;
  reviews?: number | null;
  image?: string | null;
  image1?: string | null;
  image2?: string | null;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
  image6?: string | null;
  imagem_detalhe?: string | null;
  oculto?: boolean | null;
  descricao?: string | null;
  detalhes?: string | null;
  fornecedor?: string | null;
  categoria_id?: number | null;
  categorias?: { nome: string } | null;
}

function normalizeProduto<T extends Record<string, any>>(produto: T): Produto {
  return {
    ...produto,
    image1: produto.image1 ?? produto.imagem1 ?? null,
    image2: produto.image2 ?? produto.imagem2 ?? null,
    image3: produto.image3 ?? produto.imagem3 ?? null,
    image4: produto.image4 ?? produto.imagem4 ?? null,
    image5: produto.image5 ?? produto.imagem5 ?? null,
    image6: produto.image6 ?? produto.imagem6 ?? null,
  } as Produto;
}

function toLegacyImageKeys(produto: Partial<Produto>): Record<string, any> {
  const payload: Record<string, any> = { ...produto };

  if (payload.image1 !== undefined) {
    payload.imagem1 = payload.image1;
    delete payload.image1;
  }

  if (payload.image2 !== undefined) {
    payload.imagem2 = payload.image2;
    delete payload.image2;
  }

  if (payload.image3 !== undefined) {
    payload.imagem3 = payload.image3;
    delete payload.image3;
  }

  if (payload.image4 !== undefined) {
    payload.imagem4 = payload.image4;
    delete payload.image4;
  }

  if (payload.image5 !== undefined) {
    payload.imagem5 = payload.image5;
    delete payload.image5;
  }

  if (payload.image6 !== undefined) {
    payload.imagem6 = payload.image6;
    delete payload.image6;
  }

  return payload;
}

function hasImageColumnError(error: any): boolean {
  const message = String(error?.message || '');
  return /Could not find the 'image[1-6]' column/i.test(message);
}

/**
 * List all products, optionally filtering by categoria and/or tipo_cosmetico
 */
export async function listarProdutos(
  categoria?: string,
  tipo?: string,
  incluirOcultos: boolean = false
): Promise<{ data: Produto[] | null; error: any }> {
  let query = supabase.from('produtos').select('*, categorias(nome)');

  if (categoria && categoria !== 'Todos') {
    query = query.eq('categorias.nome', categoria);
  }
  // tipo_cosmetico not present in current table schema

  if (!incluirOcultos) {
    query = query.or('oculto.is.null,oculto.eq.false');
  }

  const { data, error } = await query;
  return {
    data: data ? data.map((p: any) => normalizeProduto(p)) : null,
    error,
  };
}

/**
 * Fetch a single product by id
 */
export async function buscarProduto(
  id: number
): Promise<{ data: Produto | null; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not initialized' };
  }
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single();
  return { data: data ? normalizeProduto(data as any) : null, error };
}

/**
 * Create or update product record. Images should already be uploaded to
 * Supabase Storage; pass the public path in the object.
 */
export async function cadastrarProduto(
  produto: Partial<Produto>
): Promise<{ data: Produto | null; error: any }> {
  const { data, error } = await supabase
    .from('produtos')
    .insert(produto)
    .select()
    .single();

  if (!error) {
    return { data: data ? normalizeProduto(data as any) : null, error: null };
  }

  if (hasImageColumnError(error)) {
    const fallbackPayload = toLegacyImageKeys(produto);
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('produtos')
      .insert(fallbackPayload)
      .select()
      .single();

    return {
      data: fallbackData ? normalizeProduto(fallbackData as any) : null,
      error: fallbackError,
    };
  }

  return { data, error };
}

export async function editarProduto(
  id: number,
  produto: Partial<Produto>
): Promise<{ data: Produto | null; error: any }> {
  const { data, error } = await supabase
    .from('produtos')
    .update(produto)
    .eq('id', id)
    .select()
    .single();

  if (!error) {
    return { data: data ? normalizeProduto(data as any) : null, error: null };
  }

  if (hasImageColumnError(error)) {
    const fallbackPayload = toLegacyImageKeys(produto);
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('produtos')
      .update(fallbackPayload)
      .eq('id', id)
      .select()
      .single();

    return {
      data: fallbackData ? normalizeProduto(fallbackData as any) : null,
      error: fallbackError,
    };
  }

  return { data: null, error };
}

export async function excluirProduto(
  id: number
): Promise<{ data: Produto | null; error: any }> {
  const { data, error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id)
    .single();
  return { data, error };
}
