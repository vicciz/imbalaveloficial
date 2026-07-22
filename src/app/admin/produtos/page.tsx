"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useNavigation } from "@/src/navigation";

import {
  alterarDestaque,
  alterarVisibilidade,
  duplicarProduto,
  excluirProduto,
  listarProdutos,
  Produto,
} from "@/src/components/produto/types/produtos";

import { AdminLayout } from "@/src/components/layout/Admin";
import PageHeader from "@/src/components/Admin/common/PageHeader";
import PageCard from "@/src/components/Admin/common/PageCard";
import SearchBar from "@/src/components/Admin/common/SearchBar";
import Pagination from "@/src/components/Admin/common/Pagination";
import TableActions from "@/src/components/Admin/table/TableActions";
import StatusBadge from "@/src/components/Admin/table/StatusBadge";
import ModalVariacoes from "@/src/app/admin/ModalVariacoes/ModalVariacoes";

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
  const { goTo } = useNavigation();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const [produtoSelecionadoVariacao, setProdutoSelecionadoVariacao] =
    useState<Produto | null>(null);

  const itensPorPagina = 10;

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    const { data } = await listarProdutos(
      undefined,
      undefined,
      true
    );

    if (data) {
      setProdutos(data);
    }
  }

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) =>
      produto.nome
        .toLowerCase()
        .includes(busca.toLowerCase())
    );
  }, [produtos, busca]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      produtosFiltrados.length / itensPorPagina
    )
  );

  const produtosPagina =
    produtosFiltrados.slice(
      (pagina - 1) * itensPorPagina,
      pagina * itensPorPagina
    );

  return (
    <AdminLayout>
      <PageHeader
        titulo="Produtos"
        descricao="Gerencie os produtos da loja."
      >
        <Link href="/admin/produtos/cadastrar">
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
                    src={
                      produto.image && produto.image.trim() !== ""
                        ? produto.image
                        : "/placeholder.png"
                    }
                    alt={produto.nome}
                    className="h-14 w-14 rounded-lg border object-cover"
                  />
                </TableCell>

                <TableCell>
                  {produto.nome}
                </TableCell>

                <TableCell>
                  {produto.categorias?.nome ??
                    "-"}
                </TableCell>

                <TableCell>
                  {produto.fornecedor ??
                    "-"}
                </TableCell>

                <TableCell>
                  {Number(
                    produto.preco
                  ).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>

                <TableCell>
                  <StatusBadge
                    status={
                      produto.oculto
                        ? "oculto"
                        : "ativo"
                    }
                  />
                </TableCell>

                <TableCell>
                  <TableActions
                    oculto={
                      produto.oculto ?? false
                    }
                    destaque={
                      produto.destaque ?? false
                    }
                    onEdit={() =>
                      goTo(
                        `/admin/produtos/editar/${produto.id}`
                      )
                    }
                    onVariacoes={() =>
                      setProdutoSelecionadoVariacao(
                        produto
                      )
                    }
                    onDelete={async () => {
                      await excluirProduto(
                        produto.id
                      );
                      carregarProdutos();
                    }}
                    onDuplicate={async () => {
                      await duplicarProduto(
                        produto.id
                      );
                      carregarProdutos();
                    }}
                    onToggleVisibility={async () => {
                      await alterarVisibilidade(
                        produto.id,
                        !produto.oculto
                      );

                      carregarProdutos();
                    }}
                    onToggleHighlight={async () => {
                      await alterarDestaque(
                        produto.id,
                        !produto.destaque
                      );

                      carregarProdutos();
                    }}
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

      {produtoSelecionadoVariacao && (
        <ModalVariacoes
            produtoId={produtoSelecionadoVariacao.id}
            produtoNome={produtoSelecionadoVariacao.nome}
            produtoImagem={produtoSelecionadoVariacao.image}
            isOpen={!!produtoSelecionadoVariacao}
            onClose={() => {
              setProdutoSelecionadoVariacao(null);
              carregarProdutos();
            }}
          />
      )}
    </AdminLayout>
  );
}