"use client"

import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { useSearch } from "@/src/hooks/useSearch"
import { Input } from "@/src/components/ui/input"

import SearchDropdown from "./SearchDropdown"

interface SearchBarProps {
  className?: string
  inputClassName?: string
  dropdownClassName?: string
  placeholder?: string
}

export default function SearchBar({
  className,
  inputClassName,
  dropdownClassName,
  placeholder = "Buscar perfumes, cosméticos, marcas e muito mais...",
}: SearchBarProps) {
  const {
    rootRef,
    inputRef,
    text,
    setText,
    loading,
    error,
    products,
    suggestions,
    history,
    isOpen,
    highlightedIndex,
    shouldShowEmptyState,
    openDropdown,
    clearHistory,
    selectProduct,
    selectSuggestion,
    submitSearch,
    handleKeyDown,
  } = useSearch()

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="search"
          value={text}
          onFocus={openDropdown}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "h-12 rounded-full border border-white/30 bg-white pl-5 pr-14 text-sm text-slate-700 shadow-[0_4px_16px_rgba(17,24,39,0.06)] placeholder:text-slate-400 focus-visible:border-[#7C5CFC] focus-visible:ring-[#7C5CFC]/25 sm:text-[15px]",
            inputClassName
          )}
        />

        <button
          type="button"
          aria-label="Buscar"
          onClick={submitSearch}
          className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#7C5CFC] text-white transition hover:bg-[#6A4EF5]"
        >
          <Search className="size-4" />
        </button>
      </div>

      <SearchDropdown
        open={isOpen}
        loading={loading}
        error={error}
        history={history}
        suggestions={suggestions}
        products={products}
        activeIndex={highlightedIndex}
        showEmpty={shouldShowEmptyState}
        onSelectLabel={selectSuggestion}
        onSelectProduct={selectProduct}
        onClearHistory={clearHistory}
        className={dropdownClassName}
      />
    </div>
  )
}