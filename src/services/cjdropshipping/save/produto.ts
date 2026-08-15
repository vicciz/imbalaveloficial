import { supabase } from "@/supabaseClient";
import type { CjProdutoNormalizado } from "../types";

interface IdRow {
	id: number;
}

export interface ProdutoImportado {
	id: number;
	nome: string;
}

function normalizarNome(nome: string, fallback: string): string {
	const limpo = nome.trim();
	return limpo.length > 0 ? limpo : fallback;
}

function extrairMensagemErro(error: unknown, contexto: string): string {
	if (error instanceof Error) {
		return `${contexto}: ${error.message}`;
	}

	return `${contexto}: Erro desconhecido`;
}

async function obterOuCriarCategoriaId(nome: string): Promise<number> {
	const categoria = normalizarNome(nome, "Sem categoria");

	const { data: existente, error: erroBusca } = await supabase
		.from("categorias")
		.select("id")
		.ilike("nome", categoria)
		.maybeSingle<IdRow>();

	if (erroBusca) {
		throw new Error(extrairMensagemErro(erroBusca, "Falha ao buscar categoria"));
	}

	if (existente) {
		return existente.id;
	}

	const { data: criado, error: erroCriacao } = await supabase
		.from("categorias")
		.insert({ nome: categoria })
		.select("id")
		.single<IdRow>();

	if (erroCriacao || !criado) {
		throw new Error(extrairMensagemErro(erroCriacao, "Falha ao criar categoria"));
	}

	return criado.id;
}

async function obterOuCriarMarcaId(nome: string): Promise<number> {
	const marca = normalizarNome(nome, "Sem marca");

	const { data: existente, error: erroBusca } = await supabase
		.from("marca")
		.select("id")
		.ilike("nome", marca)
		.maybeSingle<IdRow>();

	if (erroBusca) {
		throw new Error(extrairMensagemErro(erroBusca, "Falha ao buscar marca"));
	}

	if (existente) {
		return existente.id;
	}

	const { data: criado, error: erroCriacao } = await supabase
		.from("marca")
		.insert({
			nome: marca,
			ativo: true,
		})
		.select("id")
		.single<IdRow>();

	if (erroCriacao || !criado) {
		throw new Error(extrairMensagemErro(erroCriacao, "Falha ao criar marca"));
	}

	return criado.id;
}

async function obterOuCriarFornecedorId(nome: string): Promise<number> {
	const fornecedor = normalizarNome(nome, "CJ Dropshipping");

	const { data: existente, error: erroBusca } = await supabase
		.from("fornecedores")
		.select("id")
		.ilike("nome", fornecedor)
		.maybeSingle<IdRow>();

	if (erroBusca) {
		throw new Error(extrairMensagemErro(erroBusca, "Falha ao buscar fornecedor"));
	}

	if (existente) {
		return existente.id;
	}

	const { data: criado, error: erroCriacao } = await supabase
		.from("fornecedores")
		.insert({ nome: fornecedor })
		.select("id")
		.single<IdRow>();

	if (erroCriacao || !criado) {
		throw new Error(extrairMensagemErro(erroCriacao, "Falha ao criar fornecedor"));
	}

	return criado.id;
}

export async function salvarProduto(produtoCJ: CjProdutoNormalizado): Promise<ProdutoImportado> {
	const idCategoria = await obterOuCriarCategoriaId(produtoCJ.categoria);
	const idMarca = await obterOuCriarMarcaId(produtoCJ.marca);
	const idFornecedor = await obterOuCriarFornecedorId(produtoCJ.fornecedor);

const payload = {
  nome: produtoCJ.nome,

  descricao:
    produtoCJ.descricao ||

    "Descrição indisponível.",

  detalhes:
    produtoCJ.descricao ||

    "Detalhes indisponíveis.",

  link:
    produtoCJ.link ||

    "",

  rating:
    produtoCJ.rating,

  reviews:
    produtoCJ.reviews,

  origem: "cj",

  fornecedor_produto_id:
    produtoCJ.idExterno,

  id_fornecedor:
    idFornecedor,

  marca_id:
    idMarca,

  categoria_id:
    idCategoria,

  fornecedor:
    produtoCJ.fornecedor,
};

	const { data, error } = await supabase
		.from("produto")
		.insert(payload)
		.select("id,nome")
		.single<ProdutoImportado>();
       if (error) {

    console.error(error);

    throw new Error(
        [
            error.message,
            error.details,
            error.hint,
        ]
        .filter(Boolean)
        .join(" | ")
    );

}

	// Guarda o retorno bruto do fornecedor para permitir sincronização futura
	const { error: erroImportacao } = await supabase
		.from("produto_importacao")
		.insert({
			produto_id: data.id,
			external_product_id: produtoCJ.idExterno,
			raw_json: produtoCJ.raw ?? produtoCJ,
		});

	if (erroImportacao) {
		console.warn("Não foi possível salvar produto_importacao", erroImportacao);
	}

	return data;
}
