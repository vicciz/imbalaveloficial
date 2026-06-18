"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [naoMostrar, setNaoMostrar] = useState(false);

  useEffect(() => {
    const ocultar = localStorage.getItem("ocultarNewsletter");

    if (!ocultar) {
      setOpen(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("newsletter")
        .insert({ email });

      if (error) {
        alert("Erro ao cadastrar email");
        return;
      }

      alert("Email cadastrado com sucesso!");
      if (naoMostrar) {
        localStorage.setItem("ocultarNewsletter", "true");
      }
      setOpen(false);
    } catch {
      alert("Erro ao conectar ao servidor");
    }
  };

  const fecharPopup = () => {
    if (naoMostrar) {
      localStorage.setItem("ocultarNewsletter", "true");
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white text-zinc-900 p-8 rounded-3xl w-full max-w-md relative shadow-2xl border border-black/5">

        <button
          onClick={fecharPopup}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition"
          aria-label="Fechar"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold mb-1">
          Receba novidades
        </h2>

        <p className="text-zinc-600 mb-6">
          Cadastre seu e-mail para receber ofertas exclusivas e lançamentos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            required
            placeholder="Digite seu melhor e-mail"
            className="w-full p-3 rounded-lg bg-zinc-50 border border-black/10 outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex items-center space-x-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={naoMostrar}
              onChange={(e) => setNaoMostrar(e.target.checked)}
            />
            <label>Não mostrar novamente</label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2f61b9] hover:bg-[#244e96] text-white py-3 rounded-lg font-semibold shadow-lg shadow-blue-600/25 transition"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}