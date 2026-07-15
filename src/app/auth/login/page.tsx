"use client";

import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { BackButton, useNavigation } from "@/src/navigation";

export default function Login() {
  const { goHome, goTo } = useNavigation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !senha) {
      alert("Informe email e senha");
      return;
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    ) {
      alert("Configuração do Supabase ausente. Verifique as variáveis de ambiente.");
      return;
    }

    if (!supabase) {
      alert("Configuração do Supabase ausente. Verifique as variáveis de ambiente.");
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: senha,
    });

    if (authError || !authData?.user) {
      alert(authError?.message || "Email ou senha inválidos");
      return;
    }

    const {
      data: usuario,
      error: usuarioError,
    } = await supabase
      .from("usuario")
      .select("*")
      .eq("user_id", authData.user.id)
      .single();

    if (usuarioError) {
      alert("Usuário não encontrado.");
      console.error(usuarioError);
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify(usuario)
    );

    alert("Login realizado!");
    goHome();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <BackButton label="Voltar" />
      </div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-black/10 rounded-2xl p-8 text-zinc-900 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">Entrar</h1>
        <p className="text-center text-zinc-600 mb-8">Acesse sua conta</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          

          {/* Email */}
          <div>
            <label className="block text-sm mb-1 text-zinc-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-lg bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>


          {/* Senha */}
          <div>
            <label className="block text-sm mb-1 text-zinc-600">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {/* Botão de mostrar/ocultar */}
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-900"
              >
                {mostrarSenha ? "🙈" : "👁️"}
              </button>
            </div>
          </div>


          {/* Esqueci senha */}
          <div className="text-right text-sm">
            <button
              type="button"
              className="text-indigo-600 hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition font-semibold text-white"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600 mt-6">
          Não tem uma conta?{" "}
          <button
            type="button"
            onClick={() => goTo("/auth/cadastro")}
            className="text-indigo-600 hover:underline"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
}
