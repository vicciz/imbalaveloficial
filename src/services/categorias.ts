import { supabase } from "@/supabaseClient";

export interface Categoria {
  id: number;
  nome: string;
}

// Criar categoria
export async function criarCategoria(nome: string) {
  const { data, error } = await supabase
    .from("categorias")
    .insert({ nome })
    .select("*")
    .single();

  return { data, error };
}

// Editar categoria
export async function editarCategoria(
  id: number,
  nome: string
) {
  const { data, error } = await supabase
    .from("categorias")
    .update({ nome })
    .eq("id", id)
    .select("*")
    .single();

  return { data, error };
}

// Listar categorias
export async function listarCategorias() {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nome");

  return { data, error };
}

// Buscar categoria por ID
export async function buscarCategoria(id: number) {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

// Excluir categoria
export async function excluirCategoria(id: number) {
  const { data, error } = await supabase
    .from("categorias")
    .delete()
    .eq("id", id);

  return { data, error };
}

// Adicionar produto à categoria
export async function adicionarProdutoCategoria(
  idCategoria: number,
  idProduto: number
) {
  const { data, error } = await supabase
    .from("categoria_produto")
    .insert({
      id_categoria: idCategoria,
      id_produto: idProduto,
    })
    .select()
    .single();

  return { data, error };
}

// Remover produto da categoria
export async function removerProdutoCategoria(
  idCategoria: number,
  idProduto: number
) {
  const { data, error } = await supabase
    .from("categoria_produto")
    .delete()
    .eq("id_categoria", idCategoria)
    .eq("id_produto", idProduto);

  return { data, error };
}

// Listar produtos de uma categoria
export async function listarProdutosCategoria(
  idCategoria: number
) {
  const { data, error } = await supabase
    .from("categoria_produto")
    .select(`
      id_produto,
      produto (
        id,
        nome,
        preco,
        fornecedor,
        oculto,
        destaque
      )
    `)
    .eq("id_categoria", idCategoria);

  return { data, error };
}

// Listar categorias de um produto
export async function listarCategoriasProduto(
  idProduto: number
) {
  const { data, error } = await supabase
    .from("categoria_produto")
    .select(`
      id_categoria,
      categorias (
        id,
        nome
      )
    `)
    .eq("id_produto", idProduto);

  return { data, error };
}