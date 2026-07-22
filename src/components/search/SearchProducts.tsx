import Image from "next/image"
import { Tag } from "lucide-react"

import { cn } from "@/lib/utils"
import type { SearchProduct } from "@/src/types/search"

interface SearchProductsProps {
  items: SearchProduct[]
  activeOffset: number
  activeIndex: number
  onSelect: (product: SearchProduct) => void
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export default function SearchProducts({
  items,
  activeOffset,
  activeIndex,
  onSelect,
}: SearchProductsProps) {
  if (!items.length) {
    return null
  }

  return (
    <section className="px-2 py-2">
      <div className="mb-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Produtos
      </div>

      <div className="space-y-1">
        {items.map((item, index) => {
          const itemIndex = activeOffset + index

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-slate-50",
                activeIndex === itemIndex && "bg-slate-100"
              )}
            >
              <Image
                src={item.image}
                alt={item.nome}
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 rounded-2xl border border-slate-200 object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900">{item.nome}</div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  {item.marca && <span>{item.marca}</span>}
                  {item.categoria && (
                    <span className="inline-flex items-center gap-1">
                      <Tag className="size-3" />
                      {item.categoria}
                    </span>
                  )}
                </div>

                {item.descricao && (
                  <p className="mt-1 line-clamp-1 text-xs text-slate-400">{item.descricao}</p>
                )}
              </div>

              <div className="shrink-0 text-sm font-semibold text-[#5B3EEA]">
                {formatCurrency(item.preco)}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}