"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { BackButton, useNavigation } from "@/src/navigation";

export default function ConfirmacaoEmail() {
  const { goLogin } = useNavigation();
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const emailParam = new URLSearchParams(window.location.search).get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  async function reenviarEmail() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setMensagem("Informe o email usado no cadastro.");
      return;
    }

    setEnviando(true);
    setMensagem("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirmacao`,
      },
    });

    setEnviando(false);
    setMensagem(
      error
        ? "Não foi possível reenviar o email. Aguarde alguns minutos e tente novamente."
        : "Se o email estiver cadastrado, um novo link de confirmação foi solicitado."
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <BackButton label="Voltar" />
      </div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-black/10 rounded-2xl p-8 text-zinc-900 shadow-xl text-center">
        <h1 className="text-3xl font-bold mb-3">Confirme seu email</h1>
        <p className="text-zinc-600 mb-6">
          Enviamos um link para confirmar seu endereço de email. Abra a mensagem e clique no link para ativar sua conta.
        </p>

        <div className="text-left space-y-4">
          <label className="block text-sm text-zinc-600">Email usado no cadastro</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            className="w-full px-4 py-3 rounded-lg bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="button"
            onClick={reenviarEmail}
            disabled={enviando}
            className="w-full py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 transition font-semibold text-white"
          >
            {enviando ? "Enviando..." : "Reenviar email de confirmação"}
          </button>

          {mensagem && (
            <p className="text-sm text-zinc-600" role="status">{mensagem}</p>
          )}

          <button
            type="button"
            onClick={goLogin}
            className="w-full text-indigo-600 hover:underline text-sm"
          >
            Ir para o login
          </button>
        </div>
      </div>
    </div>
  );
}
