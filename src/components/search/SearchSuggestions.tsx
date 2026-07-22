import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

interface SearchSuggestionsProps {
  items: string[]
  activeOffset: number
  activeIndex: number
  onSelect: (value: string) => void
}

export default function SearchSuggestions({
  items,
  activeOffset,
  activeIndex,
  onSelect,
}: SearchSuggestionsProps) {
  if (!items.length) {
    return null
  }

  return (
    <section className="border-b border-slate-100 px-2 py-2 last:border-b-0">
      <div className="mb-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Sugestoes
      </div>

      <div className="space-y-1">
        {items.map((item, index) => {
          const itemIndex = activeOffset + index

          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900",
                activeIndex === itemIndex && "bg-slate-100 text-slate-900"
              )}
            >
              <Sparkles className="size-4 text-[#7C5CFC]" />
              <span className="truncate">{item}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}