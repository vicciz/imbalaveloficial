import { supabase } from "../../../supabaseClient"

import type {
  SearchProduct,
  SearchResultSet,
  SearchServiceResult,
} from "@/src/types/search"

const DEFAULT_SUGGESTIONS = [
  "Perfume Masculino",
  "Perfume Feminino",
  "Cosméticos",
  "Cabelos",
  "Skincare",
  "Presentes",
] as const

const SEARCH_PRODUCTS_SELECT = `
  id,
  nome,
  preco,
  descricao,
  detalhes,
  fornecedor,
  oculto,
  categoria_id,
  categorias(nome),
  produto_imagem(
    id,
    caminho,
    ordem,
    principal
  )
`

interface SearchProdutoImagemRow {
  id: number
  caminho: string
  ordem: number
  principal: boolean
}

interface SearchCategoriaRow {
  nome: string
}

interface SearchProdutoRow {
  id: number
  nome: string
  preco: number | string | null
  descricao: string | null
  detalhes: string | null
  fornecedor: string | null
  oculto: boolean | null
  categoria_id: number | null
  categorias: SearchCategoriaRow | SearchCategoriaRow[] | null
  produto_imagem: SearchProdutoImagemRow[] | null
}

interface SearchCategoriaMatchRow {
  id: number
  nome: string
}

export interface SearchCatalogOptions {
  productLimit?: number
  suggestionLimit?: number
}

function sanitizeSearchTerm(term: string) {
  return term
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizePrice(value: number | string | null) {
  const parsed = Number(value ?? 0)

  return Number.isFinite(parsed) ? parsed : 0
}

function getCategoryName(
  category: SearchProdutoRow["categorias"]
) {
  if (!category) {
    return null
  }

  return Array.isArray(category) ? category[0]?.nome ?? null : category.nome
}

function getProductImage(images: SearchProdutoImagemRow[] | null) {
  if (!images?.length) {
    return "/placeholder.png"
  }

  const sortedImages = [...images].sort((first, second) => first.ordem - second.ordem)
  const principalImage = sortedImages.find((image) => image.principal) ?? sortedImages[0]

  if (!principalImage?.caminho) {
    return "/placeholder.png"
  }

  return supabase.storage.from("produtos").getPublicUrl(principalImage.caminho).data.publicUrl
}

function normalizeProduct(product: SearchProdutoRow): SearchProduct {
  const categoria = getCategoryName(product.categorias)

  return {
    id: product.id,
    nome: product.nome,
    preco: normalizePrice(product.preco),
    image: getProductImage(product.produto_imagem),
    marca: product.fornecedor?.trim() || null,
    categoria,
    descricao: product.descricao?.trim() || product.detalhes?.trim() || null,
    href: `/produto/${product.id}`,
  }
}

function buildRelevanceScore(product: SearchProdutoRow, searchTerm: string) {
  const normalizedTerm = searchTerm.toLowerCase()
  const nome = product.nome.toLowerCase()
  const descricao = (product.descricao ?? "").toLowerCase()
  const detalhes = (product.detalhes ?? "").toLowerCase()
  const fornecedor = (product.fornecedor ?? "").toLowerCase()
  const categoria = getCategoryName(product.categorias)?.toLowerCase() ?? ""

  let score = 0

  if (nome.includes(normalizedTerm)) score += 120
  if (nome.startsWith(normalizedTerm)) score += 30
  if (fornecedor.includes(normalizedTerm)) score += 60
  if (categoria.includes(normalizedTerm)) score += 45
  if (descricao.includes(normalizedTerm)) score += 20
  if (detalhes.includes(normalizedTerm)) score += 15

  return score
}

function dedupeProducts(products: SearchProdutoRow[]) {
  const uniqueProducts = new Map<number, SearchProdutoRow>()

  for (const product of products) {
    if (product.oculto) {
      continue
    }

    if (!uniqueProducts.has(product.id)) {
      uniqueProducts.set(product.id, product)
    }
  }

  return [...uniqueProducts.values()]
}

function buildSuggestions(
  searchTerm: string,
  products: SearchProdutoRow[],
  suggestionLimit: number
) {
  const dynamicSuggestions = new Set<string>()

  for (const product of products) {
    const categoria = getCategoryName(product.categorias)

    if (categoria) {
      dynamicSuggestions.add(categoria)
    }

    if (product.fornecedor?.trim()) {
      dynamicSuggestions.add(product.fornecedor.trim())
    }
  }

  const normalizedSearch = searchTerm.toLowerCase()
  const suggestions = [...DEFAULT_SUGGESTIONS, ...dynamicSuggestions]
    .filter((suggestion) => suggestion.toLowerCase().includes(normalizedSearch))
    .slice(0, suggestionLimit)

  if (suggestions.length >= suggestionLimit) {
    return suggestions
  }

  const fallbackSuggestions = [...DEFAULT_SUGGESTIONS].filter(
    (suggestion) => !suggestions.includes(suggestion)
  )

  return [...suggestions, ...fallbackSuggestions].slice(0, suggestionLimit)
}

async function fetchProductsByText(
  searchTerm: string,
  productLimit: number
) {
  const { data, error } = await supabase
    .from("produto")
    .select(SEARCH_PRODUCTS_SELECT)
    .or(
      [
        `nome.ilike.%${searchTerm}%`,
        `descricao.ilike.%${searchTerm}%`,
        `detalhes.ilike.%${searchTerm}%`,
        `fornecedor.ilike.%${searchTerm}%`,
      ].join(",")
    )
    .limit(productLimit * 2)

  return {
    data: (data ?? []) as SearchProdutoRow[],
    error,
  }
}

async function fetchProductsByCategory(
  searchTerm: string,
  productLimit: number
) {
  const { data: categories, error: categoriesError } = await supabase
    .from("categorias")
    .select("id, nome")
    .ilike("nome", `%${searchTerm}%`)
    .limit(5)

  if (categoriesError || !categories?.length) {
    return {
      data: [] as SearchProdutoRow[],
      error: categoriesError,
      categoryMatches: [] as SearchCategoriaMatchRow[],
    }
  }

  const categoryIds = categories.map((category) => category.id)

  const { data, error } = await supabase
    .from("produto")
    .select(SEARCH_PRODUCTS_SELECT)
    .in("categoria_id", categoryIds)
    .limit(productLimit)

  return {
    data: (data ?? []) as SearchProdutoRow[],
    error,
    categoryMatches: categories as SearchCategoriaMatchRow[],
  }
}

export async function searchCatalog(
  query: string,
  options: SearchCatalogOptions = {}
): Promise<SearchServiceResult> {
  const productLimit = options.productLimit ?? 10
  const suggestionLimit = options.suggestionLimit ?? 10
  const sanitizedQuery = sanitizeSearchTerm(query)

  if (!sanitizedQuery) {
    return {
      data: {
        suggestions: [...DEFAULT_SUGGESTIONS].slice(0, suggestionLimit),
        products: [],
      },
      error: null,
    }
  }

  const [textSearch, categorySearch] = await Promise.all([
    fetchProductsByText(sanitizedQuery, productLimit),
    fetchProductsByCategory(sanitizedQuery, productLimit),
  ])

  const serviceError = textSearch.error ?? categorySearch.error ?? null

  if (serviceError) {
    return {
      data: {
        suggestions: [],
        products: [],
      },
      error: new Error(serviceError.message ?? "Nao foi possivel buscar produtos."),
    }
  }

  const mergedProducts = dedupeProducts([...textSearch.data, ...categorySearch.data])
    .sort((first, second) => {
      return buildRelevanceScore(second, sanitizedQuery) - buildRelevanceScore(first, sanitizedQuery)
    })
    .slice(0, productLimit)

  const result: SearchResultSet = {
    suggestions: buildSuggestions(sanitizedQuery, mergedProducts, suggestionLimit),
    products: mergedProducts.map(normalizeProduct),
  }

  return {
    data: result,
    error: null,
  }
}