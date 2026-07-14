"use client";
import { useState } from "react";

export default function Perfil() {
  const [editando, setEditando] = useState(false);

  const [usuario, setUsuario] = useState({
    nome: "Vinicios Borges",
    email: "vinicios@email.com",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsuario({
      ...usuario,
      [e.target.name]: e.target.value,
    });
  };

  const salvar = () => {
    console.log("Dados atualizados:", usuario);
    setEditando(false);
    alert("Perfil atualizado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 flex justify-center items-center p-6">
      <div className="bg-white w-full max-w-md rounded-2xl border border-black/10 shadow-2xl p-8">

        {editando ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">
              Editar Perfil
            </h1>

            <input
              name="nome"
              value={usuario.nome}
              onChange={handleChange}
              className="w-full p-3 mb-4 rounded bg-slate-100 border border-black/10"
              placeholder="Nome"
            />

            <input
              name="email"
              value={usuario.email}
              onChange={handleChange}
              className="w-full p-3 mb-6 rounded bg-slate-100 border border-black/10"
              placeholder="Email"
            />

            <button
              onClick={salvar}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-semibold transition"
            >
              Salvar
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center">
              {usuario.nome}
            </h1>

            <p className="text-zinc-600 text-center mt-2">
              {usuario.email}
            </p>

            <button
              onClick={() => setEditando(true)}
              className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-semibold transition"
            >
              Editar Perfil
            </button>
          </>
        )}

      </div>
    </div>
  );
}