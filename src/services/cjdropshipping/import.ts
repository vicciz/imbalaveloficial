import { buscarProdutoPorPid } from "./products";
import { mapearProdutoCJ } from "./mapper";
import {
  criarContextoImportacao,
  registrarProdutoCriado,
  rollbackImportacao,
  salvarEspecificacoes,
  salvarImagens,
  salvarProduto,
  salvarVariacoes,
} from "./save";

function extrairMensagemErro(error: unknown, contexto: string): string {
  if (error instanceof Error) {
    return `${contexto}: ${error.message}`;
  }

  return `${contexto}: Erro desconhecido`;
}


export async function importarProdutoCJ(
  pid: string
) {
  const resposta =
    await buscarProdutoPorPid(pid);

  if (!resposta.success || !resposta.data) {
    throw new Error(
      resposta.message ?? "Falha ao obter produto da CJ"
    );
  }
console.log(JSON.stringify(resposta.data, null, 2))
  const cj = mapearProdutoCJ(resposta.data);
  console.log("Produto mapeado:", cj);
  const contexto = criarContextoImportacao();

  try {
    console.log("1 - Salvando produto");
    const produto = await salvarProduto(cj);

    registrarProdutoCriado(contexto, produto.id);

    await salvarImagens(produto.id, cj);
console.log("2 - Salvando imagens");
    await salvarVariacoes(produto.id, cj);
console.log("3 - Salvando variações");

    await salvarEspecificacoes(produto.id, cj);
    console.log("4 - Salvando especificações");
    
    return produto;
    
  } catch (error) {
    try {
      await rollbackImportacao(contexto);
    } catch (rollbackError) {
      throw new Error(
        `${extrairMensagemErro(error, "Falha na importacao")}. ${extrairMensagemErro(
          rollbackError,
          "Rollback falhou"
        )}`
      );
    }

    throw new Error(extrairMensagemErro(error, "Falha na importacao"));
  }
}