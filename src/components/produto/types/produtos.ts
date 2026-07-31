// services/produto/produtos.ts

import { supabase } from "../../../../supabaseClient";
import { listarProdutosColecao } from "@/src/services/colecao/colecao";

export interface ProdutoImagem {
  id?: number;
  id_produto: number;
  id_variacao: number | null;
  id_valor: number | null;
  caminho: string;
  ordem: number;
  principal: boolean;
}

export interface ProdutoVariacaoItem {
  id: number;

  id_variacao: number;
  id_valor: number;

  preco: number;
  estoque: number;

  sku: string | null;
  ativo: boolean;

  imagem_principal?: string | null;

  variacao_valor?: {
    id: number;
    valor: string;

    variacao_tipo?: {
      id: number;
      nome: string;
    };
  };
}

export interface ProdutoVariacao {
  id: number;

  id_produto: number;

  produto_variacao_item: ProdutoVariacaoItem[];
}

export interface Produto {
  id: number;

  nome: string;

  preco: number | null;

  estoque?: number | null;

  link?: string | null;

  rating?: number | null;

  reviews?: number | null;

  descricao?: string | null;

  detalhes?: string | null;

  fornecedor?: string | null;

  oculto?: boolean | null;

  destaque?: boolean | null;

  categoria_id?: number | null;

  categorias?: {
    nome: string;
  } | null;

  produto_imagem?: ProdutoImagem[];

  produto_variacao?: ProdutoVariacao[];

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
    imagens.find((img) => img.principal) ?? imagens[0];

  const itens =
    (produto.produto_variacao ?? [])
      .flatMap(
        (variacao: ProdutoVariacao) =>
          variacao.produto_variacao_item ?? []
      )
      .filter(
        (item: ProdutoVariacaoItem) =>
          item.ativo
      );

  const menorPreco =
    itens.length > 0
      ? Math.min(
          ...itens.map((item) => Number(item.preco))
        )
      : null;

  const estoqueTotal =
    itens.reduce(
      (total, item) =>
        total + Number(item.estoque ?? 0),
      0
    );

  return {
    ...produto,

    preco: menorPreco,

    estoque: estoqueTotal,

    image: imagemPrincipal
      ? supabase.storage
          .from("produtos")
          .getPublicUrl(imagemPrincipal.caminho)
          .data.publicUrl
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

export async function listarProdutos(
  categoria?: string,
  tipo?: string,
  incluirOcultos: boolean = false
): Promise<{
  data: Produto[] | null;
  error: any;
}> {
  const client = ensureSupabase();

  let query = client
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
      ),

      produto_variacao(
        id,
        id_produto,

        produto_variacao_item(
          id,
          id_variacao,
          id_valor,
          preco,
          estoque,
          sku,
          ativo,
          imagem_principal
        )
      )
    `);

  if (categoria && categoria !== "Todos") {
    query = query.eq("categorias.nome", categoria);
  }

  if (!incluirOcultos) {
    query = query.or("oculto.is.null,oculto.eq.false");
  }

  const { data, error } = await query;

  return {
    data: data
      ? data.map((produto: any) =>
          normalizeProduto(produto)
        )
      : null,

    error: normalizeError(error),
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
    ),

    produto_variacao(
      *,
      produto_variacao_item(
        *
      )
    )
  `)
  .ilike("nome", `%${String(texto)}%`)
  .maybeSingle();

  return {
    data: data ? normalizeProduto(data) : null,
    error: normalizeError(error),
  };
}

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

  const {
    produto_variacao,
    produto_imagem,
    categorias,
    image,
    ...dados
  } = produto;

  const { data, error } = await client
    .from("produto")
    .update(dados)
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
  ),

  produto_variacao(
    *,
    produto_variacao_item(
      *
    )
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
  ),

  produto_variacao(
    *,
    produto_variacao_item(
      *
    )
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
    ),

    produto_variacao(
      *,
      produto_variacao_item(
        *,
        variacao_valor(
          *,
          variacao_tipo(*)
        )
      )
    )
  `)
  .eq("id", id)
  .single();
  console.log(data);
  
  return {
    data: data
      ? normalizeProduto(data)
      : null,
    error: normalizeError(error),
  };

}

export async function buscarProdutosPorIds(
  ids: number[]
): Promise<{
  data: Produto[] | null;
  error: any;
}> {
  if (ids.length === 0) {
    return {
      data: [],
      error: null,
    };
  }

  const client = ensureSupabase();

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
      ),

      produto_variacao(
        id,
        id_produto,

        produto_variacao_item(
          id,
          id_variacao,
          id_valor,
          preco,
          estoque,
          sku,
          ativo,
          imagem_principal
        )
      )
    `)
    .in("id", ids);

  return {
    data: data
      ? ids
          .map((id) =>
            data
              .map((produto: any) => normalizeProduto(produto))
              .find((produto) => produto.id === id)
          )
          .filter(Boolean) as Produto[]
      : null,

    error: normalizeError(error),
  };
}
export async function listarProdutosCategoria(
  categoriaId: number,
  limite = 6
): Promise<{
  data: Produto[] | null;
  error: any;
}> {
  const client = ensureSupabase();

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
      ),

      produto_variacao(
        id,
        id_produto,

        produto_variacao_item(
          id,
          id_variacao,
          id_valor,
          preco,
          estoque,
          sku,
          ativo,
          imagem_principal
        )
      )
    `)
    .eq("categoria_id", categoriaId)
    .limit(limite);

  return {
    data: data
      ? data.map((produto: any) =>
          normalizeProduto(produto)
        )
      : null,

    error: normalizeError(error),
  };
}

export async function listarProdutosPorColecao(
  colecaoId: number
): Promise<{
  data: Produto[] | null;
  error: any;
}> {

  const {
    data,
    error,
  } = await listarProdutosColecao(
    colecaoId
  );

  if (error) {

    return {

      data: null,

      error,

    };

  }

  const ids =
    data?.map(
      produto => produto.produto_id
    ) ?? [];

  return await buscarProdutosPorIds(ids);

}
