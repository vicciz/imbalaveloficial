"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { listarProdutos, Produto } from "@/src/services/produtos";

import { AdminLayout } from "@/src/components/admin/layout";
import PageHeader from "@/src/components/admin/common/PageHeader";
import PageCard from "@/src/components/admin/common/PageCard";
import SearchBar from "@/src/components/admin/common/SearchBar";
import Pagination from "@/src/components/admin/common/Pagination";
import TableActions from "@/src/components/admin/table/TableActions";
import StatusBadge from "@/src/components/admin/table/StatusBadge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

import { Button } from "@/src/components/ui/button";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const itensPorPagina = 10;

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    const { data } = await listarProdutos();

    if (data) {
      setProdutos(data);
    }
  }

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [produtos, busca]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(produtosFiltrados.length / itensPorPagina)
  );

  const produtosPagina = produtosFiltrados.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  return (
    <AdminLayout>
      <PageHeader
        titulo="Produtos"
        descricao="Gerencie os produtos da loja."
      >
        <Link href="/admin/produtos/novo">
          <Button>Novo Produto</Button>
        </Link>
      </PageHeader>

      <SearchBar
        value={busca}
        onChange={setBusca}
        placeholder="Buscar produto..."
      />

      <PageCard>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">
                Opções
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {produtosPagina.map((produto) => (
              <TableRow key={produto.id}>
                <TableCell>
                  <img
                    src={produto.image || "/placeholder.png"}
                    alt={produto.nome}
                    className="h-14 w-14 rounded-lg object-cover border"
                  />
                </TableCell>

                <TableCell>
                  {produto.nome}
                </TableCell>

                <TableCell>
                  {produto.categorias?.nome ?? "-"}
                </TableCell>

                <TableCell>
                  {produto.fornecedor ?? "-"}
                </TableCell>

                <TableCell>
                  {Number(produto.preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>

                <TableCell>
                  <StatusBadge
                    status={produto.oculto ? "oculto" : "ativo"}
                  />
                </TableCell>

                <TableCell>
                  <TableActions
                    oculto={produto.oculto ?? false}
                    destaque={false}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onDuplicate={() => {}}
                    onToggleVisibility={() => {}}
                    onToggleHighlight={() => {}}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageCard>

      <Pagination
        pagina={pagina}
        totalPaginas={totalPaginas}
        onPageChange={setPagina}
      />
    </AdminLayout>
  );
}