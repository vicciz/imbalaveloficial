"use client";

import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function salvar() {
    if (password !== confirm) {
      alert("As senhas não coincidem.");
      return;
    }

    if (password.length < 8) {
      alert("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Senha alterada com sucesso!");

    router.push("/perfil");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">

        <h1 className="text-2xl font-bold">
          Criar nova senha
        </h1>

        <div className="mt-6 space-y-4">

          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border p-3"
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border p-3"
          />

          <button
            onClick={salvar}
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 text-white"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>

        </div>
      </div>
    </div>
  );
}