"use client";

import { ReactNode } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  children,
}: SearchBarProps) {
  return (
    <div
      className="
        mb-6
        flex
        flex-col
        gap-4
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        lg:flex-row
        lg:items-center
        lg:justify-between
      "
    >
      {/* Campo de busca */}

      <div className="relative flex-1 max-w-xl">
        <Search
          size={18}
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-slate-400
          "
        />

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            h-11
            w-full
            rounded-xl
            border
            border-slate-200
            bg-white
            pl-11
            pr-4
            text-sm
            outline-none
            transition
            focus:border-indigo-500
            focus:ring-2
            focus:ring-indigo-200
          "
        />
      </div>

      {/* Área dos filtros */}

      {children && (
        <div className="flex flex-wrap items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}