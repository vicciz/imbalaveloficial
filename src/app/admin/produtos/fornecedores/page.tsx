"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/src/components/layout/Admin";
import {
  criarFornecedor,
  editarFornecedor,
  excluirFornecedor,
  listarFornecedores,
  type Fornecedor,
} from "@/src/services/categoria/fornecedores";

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    site: "",
  });

  async function carregarFornecedores() {
    setCarregando(true);
    const { data, error } = await listarFornecedores();

    if (!error) {
      setFornecedores(data ?? []);
    } else {
      console.error("Erro ao carregar fornecedores", error);
      alert("Erro ao carregar fornecedores");
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarFornecedores();
  }, []);

  function resetarFormulario() {
    setForm({ nome: "", email: "", telefone: "", site: "" });
    setEditandoId(null);
    setModalAberto(false);
  }

  function abrirModalEdicao(fornecedor?: Fornecedor) {
    if (fornecedor) {
      setEditandoId(fornecedor.id);
      setForm({
        nome: fornecedor.nome ?? "",
        email: fornecedor.email ?? "",
        telefone: fornecedor.telefone ?? "",
        site: fornecedor.site ?? "",
      });
    } else {
      resetarFormulario();
      setForm({ nome: "", email: "", telefone: "", site: "" });
    }
    setModalAberto(true);
  }

  async function handleSubmit() {
    if (!form.nome.trim()) {
      alert("Informe o nome do fornecedor");
      return;
    }

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim() || null,
      telefone: form.telefone.trim() || null,
      site: form.site.trim() || null,
    };

    if (editandoId) {
      const { error } = await editarFornecedor(editandoId, payload);
      if (!error) {
        await carregarFornecedores();
        resetarFormulario();
      } else {
        console.error("Erro ao editar fornecedor", error);
        alert("Erro ao editar fornecedor");
      }
      return;
    }

    const { error } = await criarFornecedor(payload);
    if (!error) {
      await carregarFornecedores();
      resetarFormulario();
    } else {
      console.error("Erro ao criar fornecedor", error);
      alert("Erro ao criar fornecedor");
    }
  }

  async function handleExcluir(id: number) {
    if (!confirm("Deseja realmente excluir este fornecedor?")) return;

    const { error } = await excluirFornecedor(id);
    if (!error) {
      await carregarFornecedores();
      alert("Fornecedor excluído com sucesso");
    } else {
      console.error("Erro ao excluir fornecedor", error);
      alert("Erro ao excluir fornecedor");
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Fornecedores</h1>
            <p className="mt-2 text-sm text-slate-600">Cadastre e gerencie os fornecedores da loja.</p>
          </div>
          <button
            onClick={() => abrirModalEdicao()}
            className="rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500"
          >
            Novo fornecedor
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Fornecedores cadastrados</h2>
          </div>

          {carregando ? (
            <div className="p-6 text-sm text-slate-600">Carregando fornecedores...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-left text-sm text-slate-600">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Telefone</th>
                    <th className="px-6 py-4">Site</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedores.map((fornecedor) => (
                    <tr key={fornecedor.id} className="border-t border-slate-100 text-sm text-slate-700">
                      <td className="px-6 py-4">#{fornecedor.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{fornecedor.nome}</td>
                      <td className="px-6 py-4">{fornecedor.email ?? "-"}</td>
                      <td className="px-6 py-4">{fornecedor.telefone ?? "-"}</td>
                      <td className="px-6 py-4">{fornecedor.site ?? "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => abrirModalEdicao(fornecedor)}
                            className="rounded-lg bg-amber-100 px-3 py-2 text-amber-700 hover:bg-amber-200"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleExcluir(fornecedor.id)}
                            className="rounded-lg bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                {editandoId ? "Editar fornecedor" : "Novo fornecedor"}
              </h2>
              <button
                onClick={resetarFormulario}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                    placeholder="email@empresa.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Telefone</label>
                  <input
                    type="text"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Site</label>
                <input
                  type="text"
                  value={form.site}
                  onChange={(e) => setForm({ ...form, site: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                  placeholder="https://empresa.com"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                className="rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500"
              >
                {editandoId ? "Salvar alterações" : "Cadastrar fornecedor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
