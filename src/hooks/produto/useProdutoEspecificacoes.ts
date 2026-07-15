import { useCallback, useEffect, useState } from 'react';

import {
	listarEspecificacoesProduto,
	ProdutoEspecificacao,
} from '@/src/services/produto/produtoEspecificacoes';

interface GrupoEspecificacao {
	titulo: string;
	itens: {
		nome: string;
		valor: string;
	}[];
}

interface UseProdutoEspecificacoesReturn {
	loading: boolean;
	grupos: GrupoEspecificacao[];
	recarregar: () => Promise<void>;
}

function agruparEspecificacoes(
	especificacoes: ProdutoEspecificacao[]
): GrupoEspecificacao[] {
	const mapaGrupos = new Map<string, GrupoEspecificacao>();

	especificacoes
		.slice()
		.sort((a, b) => a.ordem - b.ordem)
		.forEach((item) => {
			const titulo = (item.grupo ?? '').trim() || 'Características Gerais';

			if (!mapaGrupos.has(titulo)) {
				mapaGrupos.set(titulo, {
					titulo,
					itens: [],
				});
			}

			mapaGrupos.get(titulo)?.itens.push({
				nome: item.nome,
				valor: item.valor,
			});
		});

	return Array.from(mapaGrupos.values());
}

export function useProdutoEspecificacoes(
	idProduto: number
): UseProdutoEspecificacoesReturn {
	const [loading, setLoading] = useState(true);
	const [grupos, setGrupos] = useState<GrupoEspecificacao[]>([]);

	const recarregar = useCallback(async () => {
		setLoading(true);

		try {
			const { data, error } = await listarEspecificacoesProduto(idProduto);

			if (error) {
				console.error('Erro ao carregar especificacoes do produto:', error);
				setGrupos([]);
				return;
			}

			setGrupos(agruparEspecificacoes(data ?? []));
		} catch (error) {
			console.error('Erro inesperado ao carregar especificacoes:', error);
			setGrupos([]);
		} finally {
			setLoading(false);
		}
	}, [idProduto]);

	useEffect(() => {
		recarregar();
	}, [recarregar]);

	return {
		loading,
		grupos,
		recarregar,
	};
}

