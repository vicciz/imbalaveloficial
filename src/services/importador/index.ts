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
} from "./imagem";

import {
  importarEspecificacaoProduto,
} from "./especificacao";

import {
  importarVariacaoProduto,
} from "./variacao";

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

    

    try {
      console.log(
      "Importando produto:",
      produto.nome
    );

      const idProduto =
        await criarProdutoImportado(
          produto
        );

      resultado.produtos++;
      atual++;

        onProgress?.(
          atual,
          total,
          produto.nome
        );


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


      // Só importa imagens se o arquivo enviado for um ZIP
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
          console.log(
            "Imagem:",
            imagem
          );
          console.log(
            "Procurando:",
            imagem.arquivo
          );

          console.log(
            "Existe no ZIP?",
            imagensZip.has(
              imagem.arquivo
            )
          );
          const blob =
            imagensZip.get(
              imagem.arquivo
            );
          
          console.log(
            "Blob encontrado?",
            !!blob
          );

          if (!blob) {

            resultado.erros.push(

              `Imagem não encontrada: ${imagem.arquivo}`

            );

            continue;

          }
          console.log(
            "Enviando para Storage..."
          );
          await importarImagemProduto(

            idProduto,

            imagem,
            blob
            

          );

          resultado.imagens++;

        }
        console.log(
          "Upload concluído."
        );

      }


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

        await importarEspecificacaoProduto(

          idProduto,

          especificacao

        );

        resultado.especificacoes++;

      }


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


      for (
        const variacao
        of variacoesProduto
      ) {

        await importarVariacaoProduto(

          idProduto,

          variacao

        );

        resultado.variacoes++;

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