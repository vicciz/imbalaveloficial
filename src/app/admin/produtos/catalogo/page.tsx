'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { listarProdutos, excluirProduto } from "@/src/services/produtos";
import { supabase } from '@/supabaseClient';

interface Produto {
  id: number;
  nome: string;
  preco: string;
  categoria_id?: number | null;
  categorias?: { nome: string } | null;
  image: File | string;
  rating: string;
  oculto?: boolean | null;
  destaque?: boolean | null;
}

interface User {
  role: string;
}

export default function CatalogoAdmin() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    carregar();
  }, []);

  async function carregar() {
    const { data, error } = await listarProdutos(undefined, undefined, true);
    if (error) {
      console.error('Erro ao carregar produtos:', error);
      return;
    }
    setProdutos(data || []);
  }

  async function handleToggleOculto(id: number, ocultoAtual?: boolean | null) {
    const { error } = await supabase
      .from('produto')
      .update({ oculto: !ocultoAtual })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar visibilidade:', error);
      if (error.message?.toLowerCase().includes('column') && error.message?.toLowerCase().includes('oculto')) {
        alert('A coluna "oculto" não existe. Crie uma coluna boolean em produtos com default false.');
      } else {
        alert(`Erro ao atualizar visibilidade: ${error.message}`);
      }
      return;
    }

    setProdutos(prev =>
      prev.map(p => (p.id === id ? { ...p, oculto: !ocultoAtual } : p))
    );
  }

  async function handleToggleDestaque(id: number, destaqueAtual?: boolean | null) {
    const { error } = await supabase
      .from('produto')
      .update({ destaque: !destaqueAtual })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar destaque:', error);
      if (error.message?.toLowerCase().includes('column') && error.message?.toLowerCase().includes('destaque')) {
        alert('A coluna "destaque" não existe. Crie uma coluna boolean em produtos com default false.');
      } else {
        alert(`Erro ao atualizar destaque: ${error.message}`);
      }
      return;
    }

    setProdutos(prev =>
      prev.map(p => (p.id === id ? { ...p, destaque: !destaqueAtual } : p))
    );
  }

  async function handleExcluir(id: number) {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    const res = await excluirProduto(id);
    if (res.status === "ok") {
      alert("Produto excluído!");
      setProdutos(produtos.filter(p => p.id !== id)); // atualiza sem reload
    } else {
      alert("Erro ao excluir");
    }
  }

  // 🔐 proteção
  if (!user || user.role !== "admin") return <p className="p-10">Acesso negado</p>;

  return (
    <div className="p-10 text-zinc-900">

      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <h1 className="text-2xl">Catálogo de Produtos</h1>

        <div className="flex gap-4 flex-wrap">
          <Link
            href="/admin/produtos/cadastrar"
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            + Novo Produto
          </Link>

          <input
            type="text"
            placeholder="Buscar produto..."
            className="bg-white border border-black/10 rounded px-4 py-2 text-zinc-900"
          />
        </div>
      </div>

      <table className="w-full bg-white rounded overflow-hidden border border-black/10">
        <thead>
          <tr className="text-left border-b border-black/10">
            <th className="p-2">Imagem</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Visibilidade</th>
            <th>Destaque</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {produtos.map(p => (
            <tr key={p.id} className="border-b border-black/5">

              <td className="p-2">
                
                {p.image ? (
                  <img
                    src={supabase.storage.from('produtos').getPublicUrl(p.image as string).data.publicUrl}
                    alt={p.nome}
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 border border-black/10 flex items-center justify-center rounded text-sm">
                    Sem imagem
                  </div>
                )}
              </td>

              <td>{p.nome}</td>
              <td>{p.categorias?.nome ?? p.categoria_id ?? '-'}</td>

              <td>
                <button
                  onClick={() => handleToggleOculto(p.id, p.oculto)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                    p.oculto
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {p.oculto ? 'Oculto' : 'Visível'}
                </button>
              </td>

              <td>
                <button
                  onClick={() => handleToggleDestaque(p.id, p.destaque)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                    p.destaque
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.destaque ? 'Em destaque' : 'Sem destaque'}
                </button>
              </td>

              <td className="flex gap-3">
                <Link
                  href={`/admin/produtos/editar?id=${p.id}`}
                  className="text-indigo-600"
                >
                  Editar
                </Link>

                <button
                  className="text-red-500"
                  onClick={() => handleExcluir(p.id)}
                >
                  Excluir
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
