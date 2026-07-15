// SeletorVariacaoImagem.tsx
"use client";

import { useEffect, useState } from "react";
import { listarVariacoesProduto } from "@/src/services/produto/variacoes";

interface Props {
  produtoId?: number;
  idVariacao: number | null;
  onChange: (id: number | null) => void;
}

export default function SeletorVariacaoImagem({
  produtoId,
  idVariacao,
  onChange,
}: Props) {
  const [variacoes, setVariacoes] = useState<any[]>([]);

  useEffect(() => {
    async function carregar() {
      if (!produtoId) return;

      const { data } = await listarVariacoesProduto(produtoId);
      setVariacoes(data ?? []);
    }

    carregar();
  }, [produtoId]);

  return (
    <div className="rounded-xl border bg-white p-6">
      <label className="mb-2 block text-sm font-medium">
        As próximas imagens serão adicionadas em
      </label>

      <select
        className="w-full rounded-md border p-2"
        value={idVariacao ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">Produto inteiro</option>

        {variacoes.map((variacao) => (
          <option key={variacao.id} value={variacao.id}>
            {variacao.produto_variacao_item
              ?.map((item: any) => item.variacao_valor?.valor)
              .join(" • ")}
          </option>
        ))}
      </select>
    </div>
  );
}