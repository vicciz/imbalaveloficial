"use client";

import { Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";

interface Props {
  value: string;
  onChange: (valor: string) => void;
}

export default function BarraPesquisa({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative">

      <Search
        className="
          absolute
          left-3
          top-1/2
          h-4
          w-4
          -translate-y-1/2
          text-muted-foreground
        "
      />

      <Input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Buscar SKU ou combinação..."
        className="pl-10"
      />

    </div>
  );
}