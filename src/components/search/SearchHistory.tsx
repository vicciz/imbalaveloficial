import { Clock3, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface SearchHistoryProps {
  items: string[]
  activeOffset: number
  activeIndex: number
  onSelect: (value: string) => void
  onClear: () => void
}

export default function SearchHistory({
  items,
  activeOffset,
  activeIndex,
  onSelect,
  onClear,
}: SearchHistoryProps) {
  if (!items.length) {
    return null
  }

  return (
    <section className="border-b border-slate-100 px-2 py-2">
      <div className="mb-1 flex items-center justify-between px-2 py-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Historico
        </span>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <Trash2 className="size-3" />
          Limpar
        </button>
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
              <Clock3 className="size-4 text-slate-400" />
              <span className="truncate">{item}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}