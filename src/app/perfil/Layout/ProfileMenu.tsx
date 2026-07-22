import { cn } from "@/lib/utils"

export interface ProfileMenuItem {
  id: string
  label: string
  icon: string
}

interface ProfileMenuProps {
  items: ProfileMenuItem[]
  activeId: string
  onSelect: (id: string) => void
  className?: string
}

export default function ProfileMenu({
  items,
  activeId,
  onSelect,
  className,
}: ProfileMenuProps) {
  return (
    <nav className={cn("space-y-2", className)}>
      {items.map((item) => {
        const isActive = item.id === activeId

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "relative flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-violet-500",
              isActive
                ? "border-violet-200 bg-violet-50 text-violet-700 shadow-sm"
                : "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white"
            )}
          >
            <span
              className={cn(
                "absolute inset-y-3 left-0 w-1 rounded-r-full transition-colors",
                isActive ? "bg-violet-600" : "bg-transparent"
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-base transition-colors",
                isActive ? "text-violet-600" : "text-slate-400"
              )}
              aria-hidden="true"
            >
              {item.icon}
            </span>
            <span className="pr-2">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}