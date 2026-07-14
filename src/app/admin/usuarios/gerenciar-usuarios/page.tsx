"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/src/layout/Admin";

import {
  Usuario,
  listarUsuarios,
  excluirUsuario,
} from "@/src/services/usuarios";

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] =
    useState<Usuario[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [busca, setBusca] =
    useState("");

  const [pagina, setPagina] =
    useState(1);

  const itensPorPagina = 10;

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    setCarregando(true);

    const { data, error } =
      await listarUsuarios();

    if (error) {
      console.error(error);
      alert(error.message);

      setCarregando(false);
      return;
    }

    setUsuarios(data ?? []);

    setCarregando(false);
  }

  async function handleExcluir(
    id: number
  ) {
    if (
      !confirm(
        "Deseja realmente excluir este usuário?"
      )
    ) {
      return;
    }

    const { error } =
      await excluirUsuario(id);

    if (error) {
      alert(error.message);
      return;
    }

    setUsuarios((prev) =>
      prev.filter(
        (u) => u.id !== id
      )
    );
  }

  const usuariosFiltrados =
    useMemo(() => {
      return usuarios.filter(
        (usuario) =>
          usuario.nome
            .toLowerCase()
            .includes(
              busca.toLowerCase()
            ) ||
          (usuario.telefone ?? "")
            .toLowerCase()
            .includes(
              busca.toLowerCase()
            )
      );
    }, [usuarios, busca]);

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        usuariosFiltrados.length /
          itensPorPagina
      )
    );

  const usuariosPagina =
    usuariosFiltrados.slice(
      (pagina - 1) *
        itensPorPagina,
      pagina *
        itensPorPagina
    );

  if (carregando) {
    return (
      <AdminLayout>
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-600">
          Carregando usuários...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Usuários</h1>
          <p className="mt-2 text-sm text-slate-600">Dados completos dos usuários cadastrados no sistema.</p>
        </div>

        <Link href="/admin/usuarios/cadastrar" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
          + Novo Usuário
        </Link>
      </div>

      {/* Busca */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <input
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1);
          }}
          placeholder="Buscar por nome, e-mail ou telefone..."
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Usuário
              </th>

              <th className="text-left">
                E-mail
              </th>

              <th className="text-left">
                Telefone
              </th>

              <th className="text-left">
                Cargo
              </th>

              <th className="text-center">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {usuariosPagina.length === 0 && (

              <tr>

                <td
                  colSpan={4}
                  className="text-center py-12 text-zinc-500"
                >
                  Nenhum usuário encontrado.
                </td>

              </tr>

            )}

            {usuariosPagina.map((usuario) => (

              <tr
                key={usuario.id}
                className="border-t hover:bg-slate-50 transition"
              >

                <td className="p-4">

                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">

                      {usuario.nome
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <div>

                      <p className="font-semibold">

                        {usuario.nome}

                      </p>

                      <p className="text-xs text-zinc-500">
                        ID #{usuario.id}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {usuario.user_id ? `Auth: ${usuario.user_id}` : "Sem identificação de auth"}
                      </p>

                    </div>

                  </div>

                </td>

                <td>
                  {usuario.email || "-"}
                </td>

                <td>
                  {usuario.telefone || "-"}
                </td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      usuario.role === "admin"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {usuario.role}
                  </span>

                </td>

                <td>

                  <div className="flex justify-center gap-2">

                    <Link
                      href={`/admin/usuarios/editar?id=${usuario.id}`}
                      className="w-10 h-10 rounded-lg bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center"
                      title="Editar"
                    >
                      ✏️
                    </Link>

                    <button
                      onClick={() =>
                        handleExcluir(usuario.id)
                      }
                      className="w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200"
                      title="Excluir"
                    >
                      🗑
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

            {/* Rodapé */}

      <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-6">

        <div className="flex gap-4">

          <div className="bg-white rounded-xl border border-black/10 px-5 py-3 shadow-sm">

            <p className="text-sm text-zinc-500">
              Total de usuários
            </p>

            <p className="text-2xl font-bold">
              {usuarios.length}
            </p>

          </div>

          <div className="bg-white rounded-xl border border-black/10 px-5 py-3 shadow-sm">

            <p className="text-sm text-zinc-500">
              Administradores
            </p>

            <p className="text-2xl font-bold text-red-600">
              {
                usuarios.filter(
                  (u) => u.role === "admin"
                ).length
              }
            </p>

          </div>

          <div className="bg-white rounded-xl border border-black/10 px-5 py-3 shadow-sm">

            <p className="text-sm text-zinc-500">
              Usuários
            </p>

            <p className="text-2xl font-bold text-emerald-600">
              {
                usuarios.filter(
                  (u) => u.role === "user"
                ).length
              }
            </p>

          </div>

        </div>

        {/* Paginação */}

        <div className="flex items-center gap-3">

          <button
            disabled={pagina === 1}
            onClick={() =>
              setPagina((p) => p - 1)
            }
            className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ←
          </button>

          {Array.from(
            {
              length: totalPaginas,
            },
            (_, index) => {

              const numero =
                index + 1;

              return (

                <button
                  key={numero}
                  onClick={() =>
                    setPagina(numero)
                  }
                  className={`w-10 h-10 rounded-lg transition ${
                    pagina === numero
                      ? "bg-indigo-600 text-white"
                      : "bg-white border hover:bg-slate-100"
                  }`}
                >
                  {numero}
                </button>

              );

            }
          )}

          <button
            disabled={
              pagina === totalPaginas
            }
            onClick={() =>
              setPagina((p) => p + 1)
            }
            className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            →
          </button>

        </div>

      </div>

      </div>
    </AdminLayout>
  );
}