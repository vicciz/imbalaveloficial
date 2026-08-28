"use client";

import { useState } from "react";
import { supabase } from "@/supabaseClient";

export default function SecurityCard() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function alterarSenha() {
    if (password !== confirmPassword) {
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

    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">
        Alterar senha
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Escolha uma senha segura para proteger sua conta.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Nova senha
          </label>

          <input
            type="password"
            className="w-full rounded-lg border p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Confirmar senha
          </label>

          <input
            type="password"
            className="w-full rounded-lg border p-3"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={alterarSenha}
            disabled={loading}
            className="rounded-lg bg-violet-600 px-5 py-2 text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Alterando..." : "Alterar senha"}
          </button>
        </div>
      </div>
    </div>
  );
}