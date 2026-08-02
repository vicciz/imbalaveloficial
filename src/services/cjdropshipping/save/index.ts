import { supabase } from "@/supabaseClient";

export interface ContextoImportacaoProduto {
	idProduto: number | null;
}

function extrairMensagemErro(error: unknown, contexto: string): string {
	if (error instanceof Error) {
		return `${contexto}: ${error.message}`;
	}

	return `${contexto}: Erro desconhecido`;
}

export function criarContextoImportacao(): ContextoImportacaoProduto {
	return {
		idProduto: null,
	};
}

export function registrarProdutoCriado(contexto: ContextoImportacaoProduto, idProduto: number): void {
	contexto.idProduto = idProduto;
}

async function excluirItensVariacao(idProduto: number): Promise<void> {
	const { data: variacoes, error: erroBusca } = await supabase
		.from("produto_variacao")
		.select("id")
		.eq("id_produto", idProduto);

	if (erroBusca) {
		throw new Error(extrairMensagemErro(erroBusca, "Falha ao buscar variacoes para rollback"));
	}

	const idsVariacao = (variacoes ?? []).map((item) => item.id as number);

	if (idsVariacao.length === 0) {
		return;
	}

	const { error: erroDelete } = await supabase
		.from("produto_variacao_item")
		.delete()
		.in("id_variacao", idsVariacao);

	if (erroDelete) {
		throw new Error(extrairMensagemErro(erroDelete, "Falha ao excluir itens de variacao no rollback"));
	}
}

export async function rollbackImportacao(contexto: ContextoImportacaoProduto): Promise<void> {
	if (!contexto.idProduto) {
		return;
	}

	const idProduto = contexto.idProduto;

	await excluirItensVariacao(idProduto);

	const { error: erroVariacaoTipo } = await supabase
		.from("produto_variacao_tipo")
		.delete()
		.eq("id_produto", idProduto);

	if (erroVariacaoTipo) {
		throw new Error(extrairMensagemErro(erroVariacaoTipo, "Falha ao excluir tipos de variacao no rollback"));
	}

	const { error: erroVariacoes } = await supabase
		.from("produto_variacao")
		.delete()
		.eq("id_produto", idProduto);

	if (erroVariacoes) {
		throw new Error(extrairMensagemErro(erroVariacoes, "Falha ao excluir variacoes no rollback"));
	}

	const { error: erroEspecificacoes } = await supabase
		.from("produto_especificacao")
		.delete()
		.eq("id_produto", idProduto);

	if (erroEspecificacoes) {
		throw new Error(extrairMensagemErro(erroEspecificacoes, "Falha ao excluir especificacoes no rollback"));
	}

	const { error: erroImagens } = await supabase
		.from("produto_imagem")
		.delete()
		.eq("id_produto", idProduto);

	if (erroImagens) {
		throw new Error(extrairMensagemErro(erroImagens, "Falha ao excluir imagens no rollback"));
	}

	const { error: erroProduto } = await supabase
		.from("produto")
		.delete()
		.eq("id", idProduto);

	if (erroProduto) {
		throw new Error(extrairMensagemErro(erroProduto, "Falha ao excluir produto no rollback"));
	}
}

export * from "./produto";
export * from "./imagens";
export * from "./variacoes";
export * from "./especificacoes";
