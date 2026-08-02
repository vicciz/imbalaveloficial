"use client";

import Link from "next/link";

import { TableColumn } from "@/src/components/Admin/table/types";
import TableActions from "@/src/components/Admin/table/TableActions";
import StatusBadge from "@/src/components/Admin/table/StatusBadge";
import { formatarPreco, obterMenorPreco } from "@/src/lib/produto-util";

import { Produto, ProdutoImagem } from "@/src/components/produto/types/produtos";

interface ProdutoColumnsProps {
  onDelete: (produto: Produto) => void;
  onDuplicate: (produto: Produto) => void;
  onToggleVisibility: (produto: Produto) => void;
  onToggleHighlight: (produto: Produto) => void;
}
export function produtoColumns({
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onToggleHighlight,
}: ProdutoColumnsProps): TableColumn<Produto>[] {
  return [
    {
        key: "image",
        title: "Imagem",
        width: "90px",

        render: (produto) => (
            <img
            src={produto.image || "/placeholder.png"}
            alt={produto.nome}
            className="h-14 w-14 rounded-lg border object-cover"
            />
        ),
        },

    {
      key: "nome",
      title: "Nome",

      render: (produto) => (
        <div>
          <p className="font-medium">
            {produto.nome}
          </p>

          <span className="text-xs text-slate-500">
            #{produto.id}
          </span>
        </div>
      ),
    },

    {
      key: "categoria",
      title: "Categoria",

      render: (produto) =>
        produto.categorias?.nome ??
        "-",
    },

    {
      key: "fornecedor",
      title: "Fornecedor",

      render: (produto) =>
        produto.fornecedor ??
        "-",
    },

    {
      key: "preco",
      title: "Preço",
      align: "right",

      render: (produto) => (
        <span className="font-semibold">
          {formatarPreco(
            obterMenorPreco(produto) ?? Number(produto.preco ?? 0)
          )}
        </span>
      ),
    },

    {
      key: "status",
      title: "Status",
      align: "center",

      render: (produto) => (
        <StatusBadge
          status={
            produto.oculto
              ? "oculto"
              : "ativo"
          }
        />
      ),
    },

    {
      key: "acoes",
      title: "Opções",
      align: "center",

      render: (produto) => {
      const preco = obterMenorPreco(produto);

      return (
        <span className="font-semibold">
          {formatarPreco(
            preco ?? Number(produto.preco ?? 0)
          )}
        </span>
        );
      },
    },
  ];
}