import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/supabaseClient';
import {
  ProdutoAvaliacao,
  listarAvaliacoesProduto,
  buscarAvaliacaoUsuario,
  cadastrarAvaliacao,
  atualizarAvaliacao,
  excluirAvaliacao,
  calcularEstatisticasAvaliacoes,
} from '@/src/components/produto/types/produtoAvaliacoes';
import { editarProduto } from '@/src/components/produto/types/produtos';

interface UseAvaliacoesReturn {
  avaliacoes: (ProdutoAvaliacao & { usuario?: any })[];
  avaliacaoUsuario: ProdutoAvaliacao | null;
  loading: boolean;
  error: string | null;
  sucesso: string | null;
  submitting: boolean;
  
  // Funções
  enviarAvaliacao: (nota: number, comentario: string) => Promise<void>;
  deletarAvaliacao: (idAvaliacao: number) => Promise<void>;
  recarregarAvaliacoes: () => Promise<void>;
  limparMensagens: () => void;
}

export function useAvaliacoes(idProduto: number): UseAvaliacoesReturn {
  const [avaliacoes, setAvaliacoes] = useState<(ProdutoAvaliacao & { usuario?: any })[]>([]);
  const [avaliacaoUsuario, setAvaliacaoUsuario] = useState<ProdutoAvaliacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Carregar avaliações do produto
  const recarregarAvaliacoes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: avaliacoesList, error: erroLista } = await listarAvaliacoesProduto(idProduto);

      if (erroLista) {
        console.error('Erro ao listar avaliações:', erroLista);
        setError('Erro ao carregar avaliações');
        setAvaliacoes([]);
      } else {
        setAvaliacoes(avaliacoesList ?? []);
      }

      // Carregar avaliação do usuário logado
      const { data: user } = await supabase.auth.getUser();

      if (user?.user) {
        const { data: avaliacaoUserData, error: erroUserAvaliacao } = await buscarAvaliacaoUsuario(
          idProduto,
          user.user.id
        );

        if (erroUserAvaliacao && erroUserAvaliacao.code !== 'PGRST116') {
          console.error('Erro ao buscar avaliação do usuário:', erroUserAvaliacao);
        } else {
          setAvaliacaoUsuario(avaliacaoUserData);
        }
      }
    } catch (err) {
      console.error('Erro ao recarregar avaliações:', err);
      setError('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  }, [idProduto]);

  // Carregar avaliações ao montar o componente
  useEffect(() => {
    recarregarAvaliacoes();
  }, [recarregarAvaliacoes]);

  // Atualizar rating e reviews do produto
  const atualizarRatingProduto = useCallback(async () => {
    try {
      const { rating, reviews } = await calcularEstatisticasAvaliacoes(idProduto);
      
      const { error: erroAtualizar } = await editarProduto(idProduto, {
        rating: rating || null,
        reviews: reviews || null,
      });

      if (erroAtualizar) {
        console.error('Erro ao atualizar rating:', erroAtualizar);
      }
    } catch (err) {
      console.error('Erro ao calcular estatísticas:', err);
    }
  }, [idProduto]);

  // Enviar avaliação (criar ou atualizar)
  const enviarAvaliacao = useCallback(
    async (nota: number, comentario: string) => {
      setSubmitting(true);
      setError(null);
      setSucesso(null);

      try {
        const { data: user } = await supabase.auth.getUser();

        if (!user?.user) {
          setError('Você precisa estar logado para avaliar');
          setSubmitting(false);
          return;
        }

        if (!nota || nota < 1 || nota > 5) {
          setError('Selecione uma nota de 1 a 5 estrelas');
          setSubmitting(false);
          return;
        }

        if (!comentario.trim()) {
          setError('Escreva um comentário');
          setSubmitting(false);
          return;
        }

        // Se já existe avaliação do usuário, atualizar
        if (avaliacaoUsuario?.id) {
          const { error: erroAtualizar } = await atualizarAvaliacao(
            avaliacaoUsuario.id,
            {
              nota,
              comentario: comentario.trim(),
            }
          );

          if (erroAtualizar) {
            setError(erroAtualizar.message || 'Erro ao atualizar avaliação');
            setSubmitting(false);
            return;
          }

          setSucesso('Avaliação atualizada com sucesso!');
        } else {
          // Criar nova avaliação
          const { data: novaAvaliacao, error: erroCriar } = await cadastrarAvaliacao({
            id_produto: idProduto,
            id_usuario: user.user.id,
            nota,
            comentario: comentario.trim(),
          });

          if (erroCriar) {
            setError(erroCriar.message || 'Erro ao enviar avaliação');
            setSubmitting(false);
            return;
          }

          setSucesso('Avaliação enviada com sucesso!');
          setAvaliacaoUsuario(novaAvaliacao);
        }

        // Atualizar lista de avaliações e rating do produto
        await recarregarAvaliacoes();
        await atualizarRatingProduto();
      } catch (err: any) {
        console.error('Erro ao enviar avaliação:', err);
        setError(err.message || 'Erro ao processar avaliação');
      } finally {
        setSubmitting(false);
      }
    },
    [idProduto, avaliacaoUsuario, recarregarAvaliacoes, atualizarRatingProduto]
  );

  // Deletar avaliação
  const deletarAvaliacao = useCallback(
    async (idAvaliacao: number) => {
      if (!confirm('Deseja realmente remover sua avaliação?')) {
        return;
      }

      setSubmitting(true);
      setError(null);
      setSucesso(null);

      try {
        const { error: erroDeletar } = await excluirAvaliacao(idAvaliacao);

        if (erroDeletar) {
          setError(erroDeletar.message || 'Erro ao remover avaliação');
          setSubmitting(false);
          return;
        }

        setSucesso('Avaliação removida com sucesso!');
        setAvaliacaoUsuario(null);

        // Recarregar e atualizar rating
        await recarregarAvaliacoes();
        await atualizarRatingProduto();
      } catch (err: any) {
        console.error('Erro ao deletar avaliação:', err);
        setError(err.message || 'Erro ao remover avaliação');
      } finally {
        setSubmitting(false);
      }
    },
    [recarregarAvaliacoes, atualizarRatingProduto]
  );

  // Limpar mensagens
  const limparMensagens = useCallback(() => {
    setError(null);
    setSucesso(null);
  }, []);

  return {
    avaliacoes,
    avaliacaoUsuario,
    loading,
    error,
    sucesso,
    submitting,
    enviarAvaliacao,
    deletarAvaliacao,
    recarregarAvaliacoes,
    limparMensagens,
  };
}
