"use client"

import { Check, ChevronDown, Search } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { Input } from "@/src/components/ui/input"
import { ScrollArea } from "@/src/components/ui/scroll-area"

export interface SearchableSelectOption {
  value: string
  label: string
  keywords?: string
}

interface SearchableSelectProps {
  id: string
  value: string
  options: SearchableSelectOption[]
  onChange: (value: string) => void
  placeholder: string
  searchPlaceholder: string
  emptyMessage: string
  disabled?: boolean
  loading?: boolean
}

export default function SearchableSelect({
  id,
  value,
  options,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled = false,
  loading = false,
}: SearchableSelectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  )

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return options
    }

    return options.filter((option) => {
      const haystack = `${option.label} ${option.keywords ?? ""}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [options, query])

  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedOption?.label ?? "")
    }
  }, [isOpen, selectedOption])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [])

  function handleFocus() {
    if (!disabled) {
      setIsOpen(true)
      setQuery("")
    }
  }

  function handleSelect(nextValue: string) {
    onChange(nextValue)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          value={isOpen ? query : (selectedOption?.label ?? "")}
          onFocus={handleFocus}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          placeholder={loading ? "Carregando..." : placeholder}
          disabled={disabled}
          className="h-12 rounded-2xl border-slate-200 bg-white pr-20 focus-visible:border-violet-500"
          autoComplete="off"
        />

        <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-slate-400">
          <Search className="size-4" />
          <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            {searchPlaceholder}
          </div>

          <ScrollArea className="max-h-64">
            <div className="p-2">
              {filteredOptions.length ? (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault()
                        handleSelect(option.value)
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 hover:bg-violet-50 hover:text-violet-700",
                        isSelected && "bg-violet-50 text-violet-700"
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="size-4" />}
                    </button>
                  )
                })
              ) : (
                <div className="px-3 py-4 text-sm text-slate-500">
                  {emptyMessage}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}