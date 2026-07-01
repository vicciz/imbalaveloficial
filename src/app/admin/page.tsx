'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/src/components/admin/layout";

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
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo, {user?.nome}
          </h1>

          <p className="text-zinc-600">
            Área administrativa do sistema
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Produtos</h2>
            <p className="mt-2 text-sm text-zinc-600">Gerencie catálogo, visibilidade e destaques.</p>
            <Link href="/admin/produtos" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:underline">
              Acessar produtos
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Coleções</h2>
            <p className="mt-2 text-sm text-zinc-600">Organize grupos e destaque produtos em campanhas.</p>
            <Link href="/admin/produtos/colecao" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:underline">
              Ver coleções
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Usuários</h2>
            <p className="mt-2 text-sm text-zinc-600">Gerencie acessos e permissões da equipe.</p>
            <Link href="/admin/usuarios/gerenciar-usuarios" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:underline">
              Gerenciar usuários
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
