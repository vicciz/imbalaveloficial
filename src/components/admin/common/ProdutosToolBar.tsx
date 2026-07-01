"use client";

import Link from "next/link";
import SearchBar from "@/src/components/admin/common/SearchBar";
import { Button } from "@/src/components/ui/button";

interface ProdutosToolbarProps {
  busca: string;
  setBusca: (value: string) => void;
}

export default function ProdutosToolbar({
  busca,
  setBusca,
}: ProdutosToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex-1">
        <SearchBar
          value={busca}
          onChange={setBusca}
          placeholder="Buscar produto..."
        />
      </div>

      <Link href="/admin/produtos/novo">
        <Button>Novo Produto</Button>
      </Link>
    </div>
  );
}