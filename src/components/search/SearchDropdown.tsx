import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { SearchProduct } from "@/src/types/search"

import SearchEmpty from "./SearchEmpty"
import SearchHistory from "./SearchHistory"
import SearchProducts from "./SearchProducts"
import SearchSuggestions from "./SearchSuggestions"

interface SearchDropdownProps {
  open: boolean
  loading: boolean
  error: string | null
  history: string[]
  suggestions: string[]
  products: SearchProduct[]
  activeIndex: number
  showEmpty: boolean
  onSelectLabel: (value: string) => void
  onSelectProduct: (product: SearchProduct) => void
  onClearHistory: () => void
  className?: string
}

export default function SearchDropdown({
  open,
  loading,
  error,
  history,
  suggestions,
  products,
  activeIndex,
  showEmpty,
  onSelectLabel,
  onSelectProduct,
  onClearHistory,
  className,
}: SearchDropdownProps) {
  if (!open) {
    return null
  }

  const suggestionsOffset = history.length
  const productsOffset = history.length + suggestions.length

  return (
    <div
      className={cn(
        "absolute left-0 top-full z-50 mt-3 w-full overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)] ring-1 ring-slate-950/5 backdrop-blur-sm",
        className
      )}
    >
      <div className="max-h-[70vh] overflow-y-auto py-2">
        <SearchHistory
          items={history}
          activeOffset={0}
          activeIndex={activeIndex}
          onSelect={onSelectLabel}
          onClear={onClearHistory}
        />

        <SearchSuggestions
          items={suggestions}
          activeOffset={suggestionsOffset}
          activeIndex={activeIndex}
          onSelect={onSelectLabel}
        />

        {loading ? (
          <div className="flex items-center gap-3 px-4 py-5 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin text-[#7C5CFC]" />
            <span>Buscando produtos...</span>
          </div>
        ) : null}

        {error ? (
          <div className="px-4 py-5 text-sm text-rose-500">{error}</div>
        ) : null}

        {!loading && !error ? (
          <SearchProducts
            items={products}
            activeOffset={productsOffset}
            activeIndex={activeIndex}
            onSelect={onSelectProduct}
          />
        ) : null}

        {!loading && !error && showEmpty ? <SearchEmpty /> : null}
      </div>
    </div>
  )
}