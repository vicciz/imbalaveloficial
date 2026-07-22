export interface SearchProduct {
  id: number
  nome: string
  preco: number
  image: string
  marca: string | null
  categoria: string | null
  descricao: string | null
  href: string
}

export interface SearchResultSet {
  suggestions: string[]
  products: SearchProduct[]
}

export interface SearchServiceResult {
  data: SearchResultSet
  error: Error | null
}

export type SearchDropdownItem =
  | {
      kind: "history" | "suggestion"
      label: string
    }
  | {
      kind: "product"
      product: SearchProduct
    }