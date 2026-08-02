import { supabase } from "@/supabaseClient";
import { variantImageMatcher, VariantImageMatcher } from "@/src/services/products/images/VariantImageMatcher";
import { variantImageService } from "@/src/services/products/services/VariantImageService";
import type {
	CjProdutoNormalizado,
} from "../types";
import type { CjVariacaoNormalizada } from "../types";

type SavedProductImage = {
	id: number;
	caminho: string;
	principal: boolean;
	ordem: number;
};
interface IdRow {
	id: number;
}

interface TipoRow {
	id: number;
	nome: string;
}

interface ValorRow {
	id: number;
}

interface ProdutoVariacaoRow {
	id: number;
}

interface ProdutoVariacaoTipoRow {
	id_tipo: number;
}

interface ProdutoVariacaoInsert {
	id_produto: number;
	sku: string;
	preco: number;
	estoque: number;
	ativo: boolean;
}

interface ProdutoVariacaoItemInsert {
	id_variacao: number;
	id_valor: number;
	preco: number;
	estoque: number;
	sku: string;
	imagem_principal: string | null;
	fornecedor_sku: string;
}

function normalizar(valor: string): string {
	return valor.trim().toLowerCase();
}

function extrairMensagemErro(error: unknown, contexto: string): string {
	if (error instanceof Error) {
		return `${contexto}: ${error.message}`;
	}

	return `${contexto}: Erro desconhecido`;
}

async function obterOuCriarTipoVariacaoId(
	nome: string,
	cacheTipos: Map<string, number>
): Promise<number> {
	const chave = normalizar(nome);

	if (cacheTipos.has(chave)) {
		return cacheTipos.get(chave)!;
	}

	const nomeLimpo = nome.trim();

	const { data: existente, error: erroBusca } = await supabase
		.from("variacao_tipo")
		.select("id,nome")
		.ilike("nome", nomeLimpo)
		.maybeSingle<TipoRow>();

	if (erroBusca) {
		throw new Error(extrairMensagemErro(erroBusca, "Falha ao buscar tipo de variacao"));
	}

	if (existente) {
		cacheTipos.set(chave, existente.id);
		return existente.id;
	}

	const { data: criado, error: erroCriacao } = await supabase
		.from("variacao_tipo")
		.insert({ nome: nomeLimpo })
		.select("id")
		.single<IdRow>();

	if (erroCriacao || !criado) {
		throw new Error(extrairMensagemErro(erroCriacao, "Falha ao criar tipo de variacao"));
	}

	cacheTipos.set(chave, criado.id);
	return criado.id;
}

async function obterOuCriarValorVariacaoId(
	idTipo: number,
	valor: string,
	cacheValores: Map<string, number>
): Promise<number> {
	const valorLimpo = valor.trim();
	const chave = `${idTipo}:${normalizar(valorLimpo)}`;

	if (cacheValores.has(chave)) {
		return cacheValores.get(chave)!;
	}

	const { data: existente, error: erroBusca } = await supabase
		.from("variacao_valor")
		.select("id")
		.eq("id_tipo", idTipo)
		.ilike("valor", valorLimpo)
		.maybeSingle<ValorRow>();

	if (erroBusca) {
		throw new Error(extrairMensagemErro(erroBusca, "Falha ao buscar valor de variacao"));
	}

	if (existente) {
		cacheValores.set(chave, existente.id);
		return existente.id;
	}

	const { data: criado, error: erroCriacao } = await supabase
		.from("variacao_valor")
		.insert({
			id_tipo: idTipo,
			valor: valorLimpo,
		})
		.select("id")
		.single<ValorRow>();

	if (erroCriacao || !criado) {
		throw new Error(extrairMensagemErro(erroCriacao, "Falha ao criar valor de variacao"));
	}

	cacheValores.set(chave, criado.id);
	return criado.id;
}

async function vincularTiposAoProduto(idProduto: number, idsTipo: number[]): Promise<void> {
	if (idsTipo.length === 0) {
		return;
	}

	const { data: existentes, error: erroExistentes } = await supabase
		.from("produto_variacao_tipo")
		.select("id_tipo")
		.eq("id_produto", idProduto)
		.in("id_tipo", idsTipo);

	if (erroExistentes) {
		throw new Error(extrairMensagemErro(erroExistentes, "Falha ao buscar relacoes de tipo do produto"));
	}

	const tipoExistenteSet = new Set((existentes as ProdutoVariacaoTipoRow[] | null)?.map((item) => item.id_tipo) ?? []);

	const faltantes = idsTipo.filter((idTipo) => !tipoExistenteSet.has(idTipo));

	if (faltantes.length === 0) {
		return;
	}

	const payload = faltantes.map((idTipo) => ({
		id_produto: idProduto,
		id_tipo: idTipo,
	}));

	const { error: erroInsert } = await supabase.from("produto_variacao_tipo").insert(payload);

	if (erroInsert) {
		throw new Error(extrairMensagemErro(erroInsert, "Falha ao vincular tipos ao produto"));
	}
}

async function criarVariacaoProduto(
	idProduto: number,
	variacao: CjVariacaoNormalizada
): Promise<number> {
	const payload: ProdutoVariacaoInsert = {
		id_produto: idProduto,
		sku: variacao.sku,
		preco: variacao.preco,
		estoque: variacao.estoque,
		ativo: variacao.ativo,
	};

	const { data, error } = await supabase
		.from("produto_variacao")
		.insert(payload)
		.select("id")
		.single<ProdutoVariacaoRow>();

	if (error || !data) {
		throw new Error(extrairMensagemErro(error, "Falha ao criar variacao do produto"));
	}

	return data.id;
}

function selecionarImagemPrincipal(imagens: SavedProductImage[]): SavedProductImage | null {
	if (imagens.length === 0) {
		return null;
	}

	return imagens.find((imagem) => imagem.principal) ?? imagens[0] ?? null;
}

export async function salvarVariacoes(
	idProduto: number,
	produtoCJ: CjProdutoNormalizado,
	imagensProduto: SavedProductImage[] = []
): Promise<number[]> {
	const cacheTipos = new Map<string, number>();
	const cacheValores = new Map<string, number>();

	const idsTipoProduto = new Set<number>();
	const variacoesCriadas: number[] = [];

	for (const variacao of produtoCJ.variacoes) {
		for (const opcao of variacao.opcoes) {
			const idTipo = await obterOuCriarTipoVariacaoId(opcao.tipo, cacheTipos);
			idsTipoProduto.add(idTipo);
		}
	}

	await vincularTiposAoProduto(idProduto, Array.from(idsTipoProduto));

	for (const variacao of produtoCJ.variacoes) {
		const idVariacao = await criarVariacaoProduto(idProduto, variacao);
		variacoesCriadas.push(idVariacao);

		const itensPayload: ProdutoVariacaoItemInsert[] = [];

		for (const opcao of variacao.opcoes) {
			const idTipo = await obterOuCriarTipoVariacaoId(opcao.tipo, cacheTipos);
			const idValor = await obterOuCriarValorVariacaoId(idTipo, opcao.valor, cacheValores);

			itensPayload.push({
				id_variacao: idVariacao,
				id_valor: idValor,
				preco: variacao.preco,
				estoque: variacao.estoque,
				sku: variacao.sku,
				imagem_principal: variacao.imagemPrincipal,
				fornecedor_sku: variacao.fornecedorSku,
			});
		}

		if (itensPayload.length === 0) {
			continue;
		}

		const { error: erroItens } = await supabase.from("produto_variacao_item").insert(itensPayload);

		if (erroItens) {
			throw new Error(extrairMensagemErro(erroItens, "Falha ao salvar itens da variacao"));
		}

		const matchedImage = variantImageMatcher.match(variacao.imagemPrincipal ?? null, imagensProduto);
		const fallbackImage = matchedImage ?? selecionarImagemPrincipal(imagensProduto);

		if (process.env.NODE_ENV !== "production") {
			console.log("===== VARIANT IMAGE MATCH =====");
			console.log("Variation Image:");
			console.log(variacao.imagemPrincipal ?? "");
			console.log("Filename:");
			console.log(VariantImageMatcher.extractFilename(variacao.imagemPrincipal ?? null));
			console.log("Matched:");
			console.log(matchedImage ? `produto_imagem.id=${matchedImage.id}` : "No match found.");
		}

		if (fallbackImage) {
			await variantImageService.linkImageToVariation(idVariacao, fallbackImage.id);
		}
	}

	return variacoesCriadas;
}
