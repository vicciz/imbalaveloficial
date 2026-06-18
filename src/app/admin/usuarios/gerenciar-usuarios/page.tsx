'use client';

import { useEffect, useState } from 'react';
import { Usuario } from '@/src/services/Usuario';
import SelectUsuarios from '@/src/app/admin/componentes/selectUsuarios';
import EnviarEmailUsuarios from '@/src/app/admin/componentes/EnviarEmailUsuarios';
import { listarUsuarios, criarUsuario, atualizarUsuario, excluirUsuario } from '@/src/services/usuarios';

export default function CatalogoAdmin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [termo, setTermo] = useState('');
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', role: 'user' });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    async function buscar() {
      const { data, error } = await listarUsuarios(termo);
      if (error) {
        console.error(error);
        setUsuarios([]);
        return;
      }
      setUsuarios(data || []);
    }

    buscar();
  }, [termo]);

  async function salvarUsuario() {
    if (!form.nome || !form.email) {
      alert('Preencha nome e email');
      return;
    }

    const payload = {
      nome: form.nome,
      email: form.email,
      role: form.role,
      ...(form.senha ? { senha: form.senha } : {}),
    };

    if (editingId) {
      const { error } = await atualizarUsuario(editingId, payload);
      if (error) {
        alert('Erro ao atualizar usuário');
        return;
      }
    } else {
      const { error } = await criarUsuario(payload);
      if (error) {
        alert('Erro ao cadastrar usuário');
        return;
      }
    }

    setForm({ nome: '', email: '', senha: '', role: 'user' });
    setEditingId(null);
    const { data } = await listarUsuarios(termo);
    setUsuarios(data || []);
  }

  function editarUsuario(usuario: Usuario) {
    setEditingId(usuario.id);
    setForm({ nome: usuario.nome, email: usuario.email, senha: '', role: usuario.role });
  }

  async function removerUsuario(id: number) {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    const { error } = await excluirUsuario(id);
    if (error) {
      alert('Erro ao excluir usuário');
      return;
    }
    setSelecionados(prev => prev.filter(i => i !== id));
    const { data } = await listarUsuarios(termo);
    setUsuarios(data || []);
  }

  async function removerSelecionados() {
    if (!selecionados.length) return;
    if (!confirm('Deseja realmente excluir os usuários selecionados?')) return;

    const results = await Promise.all(
      selecionados.map((id) => excluirUsuario(id))
    );

    const hasError = results.some(r => r.error);
    if (hasError) {
      alert('Erro ao excluir um ou mais usuários');
      return;
    }

    setSelecionados([]);
    const { data } = await listarUsuarios(termo);
    setUsuarios(data || []);
  }

  async function atualizarRoleSelecionados(role: 'user' | 'admin') {
    if (!selecionados.length) return;

    const results = await Promise.all(
      selecionados.map((id) => atualizarUsuario(id, { role }))
    );

    const hasError = results.some(r => r.error);
    if (hasError) {
      alert('Erro ao atualizar permissões');
      return;
    }

    const { data } = await listarUsuarios(termo);
    setUsuarios(data || []);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Título */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-zinc-600 mt-1">
            Busque, selecione e envie comunicações
          </p>
        </header>

        {/* Conteúdo lado a lado */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Coluna esquerda */}
          <aside className="bg-white rounded-2xl p-6 space-y-6 border border-black/10 shadow-sm">
            
            <div>
              <label className="text-sm text-zinc-600">
                Buscar usuários
              </label>
              <input
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Digite o nome ou letra..."
                className="mt-2 w-full bg-slate-50 border border-black/10
                           rounded-xl px-4 py-3 text-sm
                           placeholder:text-zinc-500
                           focus:outline-none focus:ring-2 focus:ring-pink-600"
              />
              <button
                type="button"
                onClick={() => setTermo('')}
                className="mt-2 text-xs text-indigo-600 hover:underline"
              >
                Listar todos
              </button>
            </div>

            <div>
              <p className="text-sm text-zinc-600 mb-2">
                Ações em massa
              </p>

              <EnviarEmailUsuarios
                usuarios={usuarios.filter(u => selecionados.includes(u.id))}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => atualizarRoleSelecionados('admin')}
                  className="bg-indigo-600 text-white px-3 py-2 rounded text-xs"
                >
                  Tornar admin
                </button>
                <button
                  onClick={() => atualizarRoleSelecionados('user')}
                  className="bg-slate-200 text-zinc-900 px-3 py-2 rounded text-xs"
                >
                  Tornar user
                </button>
                <button
                  onClick={removerSelecionados}
                  className="bg-rose-600 text-white px-3 py-2 rounded text-xs"
                >
                  Excluir selecionados
                </button>
              </div>
            </div>

            <div className="text-sm text-zinc-600">
              Selecionados:{" "}
              <span className="text-zinc-900 font-semibold">
                {selecionados.length}
              </span>
            </div>

            <div className="pt-4 border-t border-black/10 space-y-3">
              <p className="text-sm text-zinc-600">
                {editingId ? 'Editar usuário' : 'Cadastrar usuário'}
              </p>
              <input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Nome"
                className="w-full bg-slate-50 border border-black/10 rounded-xl px-4 py-2 text-sm"
              />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                className="w-full bg-slate-50 border border-black/10 rounded-xl px-4 py-2 text-sm"
              />
              <input
                type="password"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                placeholder="Senha"
                className="w-full bg-slate-50 border border-black/10 rounded-xl px-4 py-2 text-sm"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-slate-50 border border-black/10 rounded-xl px-4 py-2 text-sm"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={salvarUsuario}
                  className="bg-pink-600 text-white px-4 py-2 rounded text-sm"
                >
                  {editingId ? 'Salvar' : 'Cadastrar'}
                </button>
                {editingId && (
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setForm({ nome: '', email: '', senha: '', role: 'user' });
                    }}
                    className="bg-slate-200 text-zinc-900 px-4 py-2 rounded text-sm"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Coluna direita */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-black/10 shadow-sm">
            <SelectUsuarios
              usuarios={usuarios}
              selecionados={selecionados}
              onChange={setSelecionados}
              onEdit={editarUsuario}
              onDelete={removerUsuario}
            />
          </div>

        </section>
      </div>
    </main>
  );
}
