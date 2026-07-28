import * as XLSX from "xlsx";

import type {

  ProdutoImportacao,

  ImagemImportacao,

  EspecificacaoImportacao,

  VariacaoImportacao,

} from "./types";

export async function lerExcel(
  arquivo: File
) {

  const buffer =
    await arquivo.arrayBuffer();

  const workbook =
    XLSX.read(
      buffer,
      {
        type: "array",
      }
    );

  return {

    produtos:
      workbook.Sheets["Produtos"]

        ? XLSX.utils.sheet_to_json<ProdutoImportacao>(
            workbook.Sheets["Produtos"],
            {
              defval: "",
            }
          )

        : [],

    imagens:
      workbook.Sheets["Imagens"]

        ? XLSX.utils.sheet_to_json<ImagemImportacao>(
            workbook.Sheets["Imagens"],
            {
              defval: "",
            }
          )

        : [],

    especificacoes:
      workbook.Sheets["Especificacoes"]

        ? XLSX.utils.sheet_to_json<EspecificacaoImportacao>(
            workbook.Sheets["Especificacoes"],
            {
              defval: "",
            }
          )

        : [],

    variacoes:
      workbook.Sheets["Variacoes"]

        ? XLSX.utils.sheet_to_json<VariacaoImportacao>(
            workbook.Sheets["Variacoes"],
            {
              defval: "",
            }
          )

        : [],

  };

}

export async function lerProdutosExcel(
  arquivo: File
) {

  const buffer =
    await arquivo.arrayBuffer();

  const workbook =
    XLSX.read(
      buffer,
      {
        type: "array",
      }
    );

  if (
    !workbook.Sheets["Produtos"]
  ) {

    throw new Error(
      "A aba Produtos não foi encontrada."
    );

  }

  return XLSX.utils.sheet_to_json<ProdutoImportacao>(
    workbook.Sheets["Produtos"],
    {
      defval: "",
    }
  );

}