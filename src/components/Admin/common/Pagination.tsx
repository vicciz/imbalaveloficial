"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface PaginationProps {
  pagina: number;
  totalPaginas: number;
  onPageChange: (pagina: number) => void;
}

export default function Pagination({
  pagina,
  totalPaginas,
  onPageChange,
}: PaginationProps) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between">
      <span className="text-sm text-slate-500">
        Página {pagina} de {totalPaginas}
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={pagina === 1}
          onClick={() => onPageChange(pagina - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPaginas }).map((_, index) => {
          const numero = index + 1;

          return (
            <Button
              key={numero}
              size="icon"
              variant={
                numero === pagina
                  ? "default"
                  : "outline"
              }
              onClick={() => onPageChange(numero)}
            >
              {numero}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="icon"
          disabled={pagina === totalPaginas}
          onClick={() => onPageChange(pagina + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}