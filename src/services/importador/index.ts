import {
  lerZip,
} from "./zip";

import {
  lerExcel,
} from "./excel";

import {
  criarProdutoImportado,
} from "./produto";

import {
  importarImagemProduto,
  type ImagemProdutoSalva,
} from "./imagem";

import {
  importarEspecificacaoProduto,
} from "./especificacao";

import {
  importarVariacaoProduto,
} from "./variacao";

import { limparProdutoImportado } from "./limparProdutoImportado";

export async function importarCatalogo(
  arquivo: File,
  onProgress?: (
    atual: number,
    total: number,
    nome: string
  ) => void
) {

  let excel: File;

  let imagensZip =
    new Map<string, Blob>();
  let imagensSalvas: ImagemProdutoSalva[] = [];

  if (
    arquivo.name
      .toLowerCase()
      .endsWith(".xlsx")
  ) {

    excel = arquivo;

  } else {

    const zip =
      await lerZip(
        arquivo
      );

    console.log(
      "Quantidade de imagens no ZIP:",
      zip.imagens.size
    );

    excel =
      zip.excel;

    imagensZip =
      zip.imagens;

  }

  const {

    produtos,

    imagens,

    especificacoes,

    variacoes,

  } =
    await lerExcel(
      excel
    );

  console.log("=== IMAGENS LIDAS DO EXCEL ===");
  console.table(imagens);

  console.group("=== IMPORTAÇÃO ===");

  console.log("Produtos:", produtos);
  console.log("Imagens:", imagens);
  console.log("Especificações:", especificacoes);
  console.log("Variações:", variacoes);

  console.groupEnd();

  const resultado = {

    produtos: 0,

    imagens: 0,

    especificacoes: 0,

    variacoes: 0,

    erros: [] as string[],

  };

  const total =
    produtos.length;

  let atual = 0;

  for (
    const produto
    of produtos
  ) {

    imagensSalvas = [];

    try {

      console.log(
        "Importando produto:",
        produto.nome
      );

      const idProduto =
        await criarProdutoImportado(
          produto
        );
      
      await limparProdutoImportado(idProduto);

      resultado.produtos++;
      atual++;

      onProgress?.(
        atual,
        total,
        produto.nome
      );

      // ===========================
      // IMAGENS
      // ===========================

      const imagensProduto =
        imagens.filter(
          (imagem) =>
            imagem.produto
              .trim()
              .toLowerCase() ===
            produto.nome
              .trim()
              .toLowerCase()
        );

      console.log(
        "Imagens encontradas:",
        imagensProduto
      );

      if (
        imagensZip.size > 0
      ) {

        console.log(
          "Quantidade de imagens:",
          imagensProduto.length
        );

        for (
          const imagem
          of imagensProduto
        ) {

          const blob =
            imagensZip.get(
              imagem.arquivo
            );

          if (!blob) {

            resultado.erros.push(

              `Imagem não encontrada: ${imagem.arquivo}`

            );

            continue;

          }

          const imagemSalva = await importarImagemProduto(

            idProduto,

            imagem,

            blob

          );

          imagensSalvas.push(imagemSalva);

          resultado.imagens++;

        }

      }

      // ===========================
      // VARIAÇÕES
      // ===========================

      const variacoesProduto =
        variacoes.filter(
          (item) =>
            item.produto
              .trim()
              .toLowerCase() ===
            produto.nome
              .trim()
              .toLowerCase()
        );

      const tiposVariacao =
        new Set<string>();

      for (
        const variacao
        of variacoesProduto
      ) {

        tiposVariacao.add(

          variacao.tipo
            .trim()
            .toLowerCase()

        );

        await importarVariacaoProduto(

          idProduto,

          variacao,

          imagensSalvas

        );

        resultado.variacoes++;

      }

      // ===========================
      // ESPECIFICAÇÕES
      // ===========================

      const especificacoesProduto =
        especificacoes.filter(
          (item) =>
            item.produto
              .trim()
              .toLowerCase() ===
            produto.nome
              .trim()
              .toLowerCase()
        );

      for (
        const especificacao
        of especificacoesProduto
      ) {

        const importada =
          await importarEspecificacaoProduto(

            idProduto,

            especificacao,

            tiposVariacao

          );

        if (importada) {

          resultado.especificacoes++;

        }

      }

    } catch (error) {

      console.error(
        "Erro importando",
        produto.nome,
        error
      );

      resultado.erros.push(

        `Erro no produto ${produto.nome}: ${
          error instanceof Error
            ? error.message
            : "Erro desconhecido"
        }`

      );

    }

    console.log(
      "Resultado:",
      resultado
    );

  }

  return resultado;

}