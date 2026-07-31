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
    XLSX.read(buffer, {
      type: "array",
    });

  return {
    produtos: workbook.Sheets["Produtos"]
      ? XLSX.utils
          .sheet_to_json(workbook.Sheets["Produtos"], {
            defval: "",
          })
          .map((p: any) => ({
            nome: p["Nome"],
            descricao: p["Descrição"],
            detalhes: p["Detalhes"],
            categoria: p["Categoria"],
            marca: p["Marca"],
            fornecedor: p["Fornecedor"],
            destaque: p["Destaque"],
            oculto: p["Oculto"],
            link: p["Link"],
          }))
      : [],

    imagens: workbook.Sheets["Imagens"]
      ? XLSX.utils
          .sheet_to_json(workbook.Sheets["Imagens"], {
            defval: "",
          })
          .map((i: any) => ({
            produto: i["Produto"],
            valor: i["Valor"],
            arquivo: i["Arquivo"],
            principal: i["Principal"],
            ordem: Number(i["Ordem"]),
          }))
      : [],

    especificacoes: workbook.Sheets["Especificacoes"]
      ? XLSX.utils
          .sheet_to_json(workbook.Sheets["Especificacoes"], {
            defval: "",
          })
          .map((e: any) => ({
            produto: e["Produto"],
            grupo: e["Grupo"],
            nome: e["Nome"],
            valor: e["Valor"],
            ordem: Number(e["Ordem"] || 0),
          }))
      : [],

    variacoes: workbook.Sheets["Variacoes"]
      ? XLSX.utils
          .sheet_to_json(workbook.Sheets["Variacoes"], {
            defval: "",
          })
          .map((v: any) => ({
            produto: v["Produto"],
            tipo: v["Tipo"],
            valor: v["Valor"],
            preco: v["Preço"],
            estoque: v["Estoque"],
            sku: v["SKU"],
            imagem_principal: v["Imagem Principal"],
          }))
      : [],
  };
}

export async function lerProdutosExcel(
  arquivo: File
) {
  const buffer =
    await arquivo.arrayBuffer();

  const workbook =
    XLSX.read(buffer, {
      type: "array",
    });

  if (!workbook.Sheets["Produtos"]) {
    throw new Error(
      "A aba Produtos não foi encontrada."
    );
  }

  return XLSX.utils
    .sheet_to_json(workbook.Sheets["Produtos"], {
      defval: "",
    })
    .map((p: any) => ({
      nome: p["Nome"],
      descricao: p["Descrição"],
      detalhes: p["Detalhes"],
      categoria: p["Categoria"],
      marca: p["Marca"],
      fornecedor: p["Fornecedor"],
      destaque: p["Destaque"],
      oculto: p["Oculto"],
      link: p["Link"],
    }));
}