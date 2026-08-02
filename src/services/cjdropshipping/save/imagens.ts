import { supabase } from "@/supabaseClient";
import type { CjProdutoNormalizado } from "../types";
import { importarImagemCJ } from "../storage";

interface ImagemInserida {
	id: number;
}

interface ImagemPayload {
	id_produto: number;
	caminho: string;
	ordem: number;
	principal: boolean;
}

function extrairMensagemErro(error: unknown, contexto: string): string {
	if (error instanceof Error) {
		return `${contexto}: ${error.message}`;
	}

	return `${contexto}: Erro desconhecido`;
}

export async function salvarImagens(idProduto: number, produtoCJ: CjProdutoNormalizado): Promise<number[]> {
	const imagens = produtoCJ.imagens.filter((imagem) => imagem.caminho.trim().length > 0);

	if (imagens.length === 0) {
		return [];
	}

const payload = [];

for (const imagem of imagens) {

  const caminho =
    await importarImagemCJ(
      imagem.caminho
    );

  payload.push({
    id_produto: idProduto,

    caminho,

    ordem: imagem.ordem,

    principal:
      imagem.principal,
  });

}

	const { data, error } = await supabase
		.from("produto_imagem")
		.insert(payload)
		.select("id");

	if (error || !data) {
		throw new Error(extrairMensagemErro(error, "Falha ao salvar imagens do produto"));
	}

	return data.map((imagem) => imagem.id);
}
