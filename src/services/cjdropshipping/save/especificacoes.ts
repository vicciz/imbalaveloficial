import { supabase } from "@/supabaseClient";
import type { CjProdutoNormalizado } from "../types";

interface EspecificacaoPayload {
	id_produto: number;
	grupo: string;
	nome: string;
	valor: string;
	ordem: number;
}

function extrairMensagemErro(error: unknown, contexto: string): string {
	if (error instanceof Error) {
		return `${contexto}: ${error.message}`;
	}

	return `${contexto}: Erro desconhecido`;
}

export async function salvarEspecificacoes(
	idProduto: number,
	produtoCJ: CjProdutoNormalizado
): Promise<number> {
	const payload: EspecificacaoPayload[] = produtoCJ.especificacoes.map((especificacao, indice) => ({
		id_produto: idProduto,
		grupo: especificacao.grupo,
		nome: especificacao.nome,
		valor: especificacao.valor,
		ordem: especificacao.ordem ?? indice,
	}));

	if (payload.length === 0) {
		return 0;
	}

	const { error } = await supabase.from("produto_especificacao").insert(payload);

	if (error) {
		throw new Error(extrairMensagemErro(error, "Falha ao salvar especificacoes"));
	}

	return payload.length;
}
