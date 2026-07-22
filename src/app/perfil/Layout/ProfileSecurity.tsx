"use client";

import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { BackButton } from "@/src/navigation";
import { alterarSenha } from "@/src/services/usuario";
export default function ProfileSecurity() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);


async function enviarEmail() {
  setLoading(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    alert("Usuário não encontrado.");
    setLoading(false);
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  setLoading(false);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Enviamos um link para o seu e-mail.");
}
  return (
  <div className="min-h-screen bg-[#F8F8FC]">
    <div className="mx-auto max-w-3xl px-4 py-8">
      <BackButton
        label="Voltar ao perfil"
        destination="/perfil"
      />

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
            <span className="text-3xl">🔒</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Alterar senha
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Para proteger sua conta, enviaremos um link seguro para o seu
              e-mail cadastrado. Após clicar no link, você poderá criar uma
              nova senha.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50 p-5">
          <h2 className="font-semibold text-violet-900">
            Como funciona?
          </h2>

          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>📧 Enviaremos um link de redefinição para seu e-mail.</li>
            <li>🔗 Clique no link recebido.</li>
            <li>🔑 Escolha uma nova senha.</li>
            <li>✅ Faça login novamente com a nova senha.</li>
          </ul>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={enviarEmail}
            disabled={loading}
            className="rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Enviando e-mail..."
              : "Enviar link de redefinição"}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}