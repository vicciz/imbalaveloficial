"use client"

import { useRouter } from "next/navigation"
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { searchCatalog } from "@/src/services/search/search.service"
import type {
  SearchDropdownItem,
  SearchProduct,
  SearchResultSet,
} from "@/src/types/search"

const SEARCH_HISTORY_KEY = "imbalavel:search-history"
const DEFAULT_SUGGESTIONS = [
  "Perfume Masculino",
  "Perfume Feminino",
  "Cosméticos",
  "Cabelos",
  "Skincare",
  "Presentes",
] as const

interface UseSearchOptions {
  productLimit?: number
  suggestionLimit?: number
  debounceMs?: number
}

function getInitialHistory() {
  if (typeof window === "undefined") {
    return [] as string[]
  }

  try {
    const storedValue = window.localStorage.getItem(SEARCH_HISTORY_KEY)

    if (!storedValue) {
      return [] as string[]
    }

    const parsedValue = JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return [] as string[]
    }

    return parsedValue
      .filter((entry): entry is string => typeof entry === "string")
      .slice(0, 10)
  } catch {
    return [] as string[]
  }
}

function persistHistory(history: string[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
}

export function useSearch(options: UseSearchOptions = {}) {
  const router = useRouter()
  const productLimit = options.productLimit ?? 10
  const suggestionLimit = options.suggestionLimit ?? 10
  const debounceMs = options.debounceMs ?? 300

  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResultSet>({
    suggestions: [],
    products: [],
  })
  const [history, setHistory] = useState<string[]>(getInitialHistory)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const trimmedText = text.trim()

  const historyItems = useMemo(() => {
    if (!history.length) {
      return []
    }

    if (!trimmedText) {
      return history.slice(0, 5)
    }

    return history
      .filter((item) => item.toLowerCase().includes(trimmedText.toLowerCase()))
      .slice(0, 5)
  }, [history, trimmedText])

  const suggestionItems = useMemo(() => {
    if (trimmedText) {
      return results.suggestions.slice(0, suggestionLimit)
    }

    return [...DEFAULT_SUGGESTIONS].slice(0, suggestionLimit)
  }, [results.suggestions, suggestionLimit, trimmedText])

  const productItems = useMemo(() => results.products.slice(0, productLimit), [results.products, productLimit])

  const dropdownItems = useMemo<SearchDropdownItem[]>(() => {
    return [
      ...historyItems.map((label) => ({ kind: "history" as const, label })),
      ...suggestionItems.map((label) => ({ kind: "suggestion" as const, label })),
      ...productItems.map((product) => ({ kind: "product" as const, product })),
    ]
  }, [historyItems, productItems, suggestionItems])

  const shouldShowEmptyState = Boolean(trimmedText) && !loading && !error && !productItems.length
  const canOpenDropdown = Boolean(
    historyItems.length || suggestionItems.length || productItems.length || shouldShowEmptyState || loading || error
  )

  useEffect(() => {
    if (highlightedIndex < dropdownItems.length) {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      setHighlightedIndex(dropdownItems.length ? 0 : -1)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [dropdownItems.length, highlightedIndex])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [])

  useEffect(() => {
    if (!trimmedText) {
      const resetTimer = window.setTimeout(() => {
        setLoading(false)
        setError(null)
        setResults({ suggestions: [], products: [] })
      }, 0)

      return () => window.clearTimeout(resetTimer)
    }

    const timeoutId = window.setTimeout(async () => {
      setLoading(true)
      setError(null)

      const { data, error: serviceError } = await searchCatalog(trimmedText, {
        productLimit,
        suggestionLimit,
      })

      if (serviceError) {
        setError(serviceError.message)
        setResults({ suggestions: [], products: [] })
        setLoading(false)
        return
      }

      setResults(data)
      setLoading(false)
    }, debounceMs)

    return () => window.clearTimeout(timeoutId)
  }, [debounceMs, productLimit, suggestionLimit, trimmedText])

  function saveToHistory(value: string) {
    const normalizedValue = value.trim()

    if (!normalizedValue) {
      return
    }

    setHistory((currentHistory) => {
      const nextHistory = [
        normalizedValue,
        ...currentHistory.filter(
          (entry) => entry.toLowerCase() !== normalizedValue.toLowerCase()
        ),
      ].slice(0, 10)

      persistHistory(nextHistory)

      return nextHistory
    })
  }

  function clearHistory() {
    setHistory([])
    persistHistory([])
  }

  function closeDropdown() {
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  function openDropdown() {
    if (!canOpenDropdown) {
      return
    }

    setIsOpen(true)
  }

  function applyText(value: string) {
    setText(value)
    setHighlightedIndex(-1)
    setIsOpen(Boolean(value.trim()) || history.length > 0)
  }

  function selectProduct(product: SearchProduct) {
    saveToHistory(text || product.nome)
    closeDropdown()
    router.push(product.href)
  }

  function selectLabel(label: string) {
    setText(label)
    setHighlightedIndex(-1)
    setIsOpen(true)
    inputRef.current?.focus()
  }

  function submitCurrentSelection() {
    const currentItem = highlightedIndex >= 0 ? dropdownItems[highlightedIndex] : null

    if (currentItem?.kind === "product") {
      selectProduct(currentItem.product)
      return
    }

    if (currentItem?.kind === "history" || currentItem?.kind === "suggestion") {
      selectLabel(currentItem.label)
      return
    }

    if (productItems[0]) {
      selectProduct(productItems[0])
      return
    }

    if (trimmedText) {
      saveToHistory(trimmedText)
      closeDropdown()
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      closeDropdown()
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()

      if (!dropdownItems.length) {
        return
      }

      setIsOpen(true)
      setHighlightedIndex((current) => (current + 1) % dropdownItems.length)
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()

      if (!dropdownItems.length) {
        return
      }

      setIsOpen(true)
      setHighlightedIndex((current) => {
        if (current <= 0) {
          return dropdownItems.length - 1
        }

        return current - 1
      })
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      submitCurrentSelection()
    }
  }

  return {
    rootRef,
    inputRef,
    text,
    setText: applyText,
    loading,
    error,
    products: productItems,
    suggestions: suggestionItems,
    history: historyItems,
    isOpen: isOpen && canOpenDropdown,
    highlightedIndex,
    shouldShowEmptyState,
    openDropdown,
    closeDropdown,
    clearHistory,
    selectProduct,
    selectSuggestion: selectLabel,
    submitSearch: submitCurrentSelection,
    handleKeyDown,
  }
}