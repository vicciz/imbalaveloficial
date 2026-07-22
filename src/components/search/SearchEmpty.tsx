import { SearchX } from "lucide-react"

export default function SearchEmpty() {
  return (
    <div className="flex items-center gap-3 px-4 py-5 text-sm text-slate-500">
      <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <SearchX className="size-4" />
      </span>
      <div>
        <p className="font-medium text-slate-700">Nenhum produto encontrado.</p>
        <p>Tente buscar por outra marca, categoria ou fragrancia.</p>
      </div>
    </div>
  )
}