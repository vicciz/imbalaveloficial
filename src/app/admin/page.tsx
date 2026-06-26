'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export default function AdminHome() {

  const [user, setUser] = useState<User | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");

    if (u) {
      setUser(JSON.parse(u));
    }

    setCarregado(true);
  }, []);

  if (!carregado) return <p>Carregando...</p>;

  // 🔐 BLOQUEIO PRINCIPAL
  if (!user || user.role !== "admin") {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl mb-4">Acesso negado</h1>
        <p>Você não tem permissão para acessar esta área.</p>

        <Link href="/" className="text-indigo-400">
          Voltar para o site
        </Link>
      </div>
    );
  } // FIM DO BLOQUEIO

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 flex">

      {/* MENU LATERAL */}
      <aside className="w-64 bg-white p-6 border-r border-black/10">

        <h2 className="text-xl font-bold mb-6">
          Painel Admin
        </h2>

        <nav className="flex flex-col gap-4">

          <Link href="/admin/produtos/cadastrar"
            className="hover:text-indigo-600">
            ➕ Cadastrar Produto
          </Link>

          <Link href="/admin/produtos"
            className="hover:text-indigo-600">
            📦 Produtos
          </Link>

          <Link href="/admin/catalogo"
            className="hover:text-indigo-600">
            🗂️ Catálogos
          </Link>

          <Link href="/admin/pedidos"
            className="hover:text-indigo-600">
            🧾 Pedidos
          </Link>

          <Link href="/admin/usuarios"
            className="hover:text-indigo-600">
            👤 Usuários
          </Link>

        </nav>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-10">

        <h1 className="text-3xl font-bold mb-2">
          Bem-vindo, {user?.nome}
        </h1>

        <p className="text-zinc-600 mb-8">
          Área administrativa do sistema
        </p>

        <div className="grid grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded border border-black/10 shadow-sm">
            <h3 className="text-lg mb-2">Gerenciar coleção</h3>

            <Link href="/admin/produtos/colecao">
              <p className="text-sm text-zinc-600 hover:text-indigo-600 cursor-pointer">
                Gerenciar novas coleções
              </p>
            </Link>
          </div>
          <div className="bg-white p-6 rounded border border-black/10 shadow-sm">
            <h3 className="text-lg mb-2">Gerenciar coleção</h3>
          <Link href="/pedidos">
              <p className="text-sm text-zinc-600 hover:text-indigo-600 cursor-pointer">
                Pedidos
              </p>
            </Link>
          </div>
          <div className="bg-white p-6 rounded border border-black/10 shadow-sm">
            <h3 className="text-lg mb-2">Usuários</h3>
            <Link href="/admin/usuarios/gerenciar-usuarios">
              <p className="text-sm text-zinc-600 hover:text-indigo-600 cursor-pointer">
                Controle de contas
              </p>
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
}
