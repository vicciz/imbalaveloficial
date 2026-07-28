// services/produtos.ts – wrapper around Supabase table `produtos`
import { supabase } from '../../supabaseClient';

export interface ProdutoImagem {
  id?: number;
  id_produto: number
  id_variacao: number | null;
  caminho: string;
  ordem: number;
  principal: boolean;
  id_valor: number | null;
}

export interface Produto {
  id: number;
  nome: string;
  preco: string | number;

  link?: string | null;
  rating?: number | null;
  reviews?: number | null;

  descricao?: string | null;
  detalhes?: string | null;

  fornecedor?: string | null;
  oculto?: boolean | null;
  destaque?: boolean | null;
  estoque?: number | null;

  categoria_id?: number | null;
  categorias?: { nome: string } | null;

  produto_imagem?: ProdutoImagem[];
  image?: string;
}

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  return supabase;
}

function normalizeProduto(produto: any): Produto {
  const imagens =
  (produto.produto_imagem ?? [])
    .sort(
      (a: ProdutoImagem, b: ProdutoImagem) =>
        a.ordem - b.ordem
    );

  const imagemPrincipal =
    imagens.find((img: any) => img.principal) ?? imagens[0];

  return {
    ...produto,

    image: imagemPrincipal
      ? supabase.storage
          .from("produtos")
          .getPublicUrl(imagemPrincipal.caminho).data.publicUrl
      : "",

    produto_imagem: imagens,
  };
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
 * List all products, optionally filtering by categoria and/or tipo_cosmetico
 */
export async function listarProdutos(
  categoria?: string,
  tipo?: string,
  incluirOcultos: boolean = false
): Promise<{ data: Produto[] | null; error: any }> {
  const client = ensureSupabase();
  let query = client.from('produto')
.select(`
  *,
  categorias(nome),
  produto_imagem(
    id,
    id_produto,
    id_variacao,
    id_valor,
    caminho,
    ordem,
    principal
)
`)

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

export async function buscarProduto(
  texto: string | number
): Promise<{ data: Produto | null; error: any }> {
  const client = ensureSupabase();

  if (typeof texto === "number" || /^\d+$/.test(String(texto))) {
    return buscarProdutoPorId(Number(texto));
  }

  const { data, error } = await client
  .from("produto")
  .select(`
    *,
    categorias(nome),
    produto_imagem(
    id,
    id_produto,
    id_variacao,
    id_valor,
    caminho,
    ordem,
    principal
)
  `)
  .ilike("nome", `%${String(texto)}%`)
  .maybeSingle();

  return {
    data: data ? normalizeProduto(data) : null,
    error: normalizeError(error),
  };
}
/**
 * Create or update product record. Images should already be uploaded to
 * Supabase Storage; pass the public path in the object.
 */
export async function cadastrarProduto(
  produto: Partial<Produto>
): Promise<{ data: Produto | null; error: any }> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("produto")
    .insert(produto)
    .select()
    .single();

  return {
    data: data ? normalizeProduto(data) : null,
    error: normalizeError(error),
  };
}

export async function editarProduto(
  id: number,
  produto: Partial<Produto>
): Promise<{ data: Produto | null; error: any }> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("produto")
    .update(produto)
    .eq("id", id)
    .select()
    .single();

  return {
    data: data ? normalizeProduto(data) : null,
    error: normalizeError(error),
  };
}

export async function excluirProduto(id: number) {
  const client = ensureSupabase();

  const { error } = await client
    .from("produto")
    .delete()
    .eq("id", id);

  return { error };
}

export async function alterarDestaque(
  id: number,
  destaque: boolean
) {
  const client = ensureSupabase();

  return await client
    .from("produto")
    .update({
      destaque,
    })
    .eq("id", id);
}

export async function alterarVisibilidade(
  id: number,
  oculto: boolean
) {
  const client = ensureSupabase();

  return await client
    .from("produto")
    .update({
      oculto,
    })
    .eq("id", id);
}

export async function duplicarProduto(
  id: number
) {
  const { data: produto } =
    await buscarProdutoPorId(id);

  if (!produto) return;

  delete (produto as any).id;

  return cadastrarProduto({
    ...produto,
    nome: `${produto.nome} (Cópia)`,
  });
}

export async function listarProdutosOcultos() {
  const client = ensureSupabase();

  return await client
  .from("produto")
  .select(`
    *,
    categorias(nome),
    produto_imagem(
    id,
    id_produto,
    id_variacao,
    id_valor,
    caminho,
    ordem,
    principal
)
  `)
  .eq("oculto", true);
}

export async function listarProdutosOrdenados(
  campo: string,
  asc = true
) {
  const client = ensureSupabase();

  return await client
  .from("produto")
  .select(`
    *,
    categorias(nome),
    produto_imagem(
    id,
    id_produto,
    id_variacao,
    id_valor,
    caminho,
    ordem,
    principal
)
  `)
  .order(campo, {
    ascending: asc,
  });
}

export async function buscarProdutoPorId(
  id: number
): Promise<{
  data: Produto | null;
  error: any;
}> {

  const client = ensureSupabase();

  const { data, error } =
  await client
    .from("produto")
    .select(`
      *,
      categorias(nome),
      produto_imagem(
    id,
    id_produto,
    id_variacao,
    id_valor,
    caminho,
    ordem,
    principal
)
    `)
    .eq("id", id)
    .single();

  return {
    data: data
      ? normalizeProduto(data)
      : null,
    error: normalizeError(error),
  };

}