"use client";

import { useState, useEffect } from "react";
import { Star, Trash2, AlertCircle, Check } from "lucide-react";
import { Produto } from "@/src/services/produtos";
import { useAvaliacoes } from "@/src/hooks/useAvaliacoes";
import { supabase } from "@/supabaseClient";

type Props = {
  produto: Produto;
};

export default function ProductReviews({
  produto,
}: Props) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState<{ id: string; name: string } | null>(null);
  
  const {
    avaliacoes,
    avaliacaoUsuario,
    loading,
    error,
    sucesso,
    submitting,
    enviarAvaliacao,
    deletarAvaliacao,
    limparMensagens,
  } = useAvaliacoes(produto.id);

  // Verificar usuário logado
  useEffect(() => {
    async function verificarUsuario() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUsuarioLogado({
          id: user.id,
          name: user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário',
        });
      }
    }
    verificarUsuario();
  }, []);

  // Preencher formulário se já existe avaliação do usuário
  useEffect(() => {
    if (avaliacaoUsuario) {
      setNota(avaliacaoUsuario.nota);
      setComentario(avaliacaoUsuario.comentario);
    } else {
      setNota(0);
      setComentario("");
    }
  }, [avaliacaoUsuario]);

  const handleEnviarAvaliacao = async () => {
    await enviarAvaliacao(nota, comentario);
  };

  const handleDeletarAvaliacao = async () => {
    if (avaliacaoUsuario?.id) {
      await deletarAvaliacao(avaliacaoUsuario.id);
    }
  };

  const formatarData = (data: string | undefined) => {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <section className="mt-24 border-t border-slate-200 pt-12">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-4xl font-bold text-slate-900">
            Comentários ({produto.reviews ?? 0})
          </h2>

          <div className="mt-5 flex items-center gap-4">

            <span className="text-2xl font-semibold">
              Avaliar
            </span>

            <div className="flex gap-2">

              {[1, 2, 3, 4, 5].map((item) => (

                <button
                  key={item}
                  onClick={() => setNota(item)}
                  disabled={submitting}
                >

                  <Star
                    className={`h-9 w-9 transition

                    ${
                      item <= nota
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300 hover:text-yellow-400"
                    }

                    `}
                  />

                </button>

              ))}

            </div>

          </div>

        </div>

        <button className="rounded-xl bg-violet-600 px-10 py-4 text-lg font-semibold text-white transition hover:bg-violet-700">
          Comprar Agora
        </button>

      </div>

      {/* Formulário de Avaliação */}
      {nota > 0 && (

        <div className="mt-10 rounded-xl border border-slate-200 p-6">

          <h3 className="mb-4 text-xl font-semibold">
            {avaliacaoUsuario ? "Editar sua avaliação" : "Escreva sua avaliação"}
          </h3>

          {/* Mensagens de erro */}
          {error && (
            <div className="mb-4 flex gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Mensagens de sucesso */}
          {sucesso && (
            <div className="mb-4 flex gap-3 rounded-lg bg-green-50 p-4 border border-green-200">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">{sucesso}</p>
            </div>
          )}

          {!usuarioLogado && (
            <div className="mb-4 rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm text-blue-600">
                Você precisa estar{" "}
                <a href="/auth/login" className="font-semibold underline hover:no-underline">
                  logado
                </a>
                {" "}para avaliar
              </p>
            </div>
          )}

          <textarea
            rows={5}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Conte sua experiência com este produto..."
            disabled={submitting || !usuarioLogado}
            className="w-full rounded-lg border border-slate-300 p-4 outline-none focus:border-violet-500 disabled:bg-slate-50 disabled:text-slate-500"
          />

          <div className="mt-5 flex gap-3 justify-end">

            {avaliacaoUsuario && (
              <button
                onClick={handleDeletarAvaliacao}
                disabled={submitting}
                className="rounded-lg border border-red-300 bg-red-50 px-6 py-3 font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </button>
            )}

            <button
              onClick={handleEnviarAvaliacao}
              disabled={submitting || !usuarioLogado}
              className="rounded-lg bg-violet-600 px-8 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Enviando..." : avaliacaoUsuario ? "Atualizar avaliação" : "Enviar avaliação"}
            </button>

          </div>

        </div>

      )}

      {/* Lista de Avaliações */}
      {!loading && avaliacoes.length > 0 && (
        <div className="mt-12 space-y-6">

          <h3 className="text-2xl font-semibold text-slate-800">
            Avaliações de clientes
          </h3>

          {avaliacoes.map((avaliacao) => (
            <div
              key={avaliacao.id}
              className="rounded-xl border border-slate-200 p-6"
            >

              {/* Nome e Data */}
              <div className="flex items-start justify-between mb-3">

                <div>

                  <h4 className="font-semibold text-slate-900">
                    {avaliacao.usuario?.nome || "Anônimo"}
                  </h4>

                  <p className="text-sm text-slate-500">
                    {formatarData(avaliacao.criado_em)}
                  </p>

                </div>

              </div>

              {/* Estrelas */}
              <div className="flex gap-1 mb-3">

                {[1, 2, 3, 4, 5].map((item) => (
                  <Star
                    key={item}
                    className={`h-5 w-5 ${
                      item <= avaliacao.nota
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}

              </div>

              {/* Comentário */}
              <p className="text-slate-600 leading-relaxed">
                {avaliacao.comentario}
              </p>

            </div>
          ))}

        </div>
      )}

      {/* Estado Carregando */}
      {loading && (
        <div className="mt-12 text-center">
          <p className="text-slate-500">Carregando avaliações...</p>
        </div>
      )}

      {/* Sem avaliações */}
      {!loading && avaliacoes.length === 0 && nota === 0 && (
        <div className="mt-12 text-center">
          <p className="text-slate-500">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
        </div>
      )}

    </section>
  );
}