import * as cheerio from "cheerio";

export interface ProdutoSpecs {
  descricao: string;
  especificacoes: Record<string, string>;
}

export function extractSpecs(
  html: string
): ProdutoSpecs {

  const $ = cheerio.load(html);

  const texto =
    $.text()
      .replace(/\r/g, "")
      .replace(/\t/g, "")
      .replace(/\n{2,}/g, "\n")
      .trim();

  const especificacoes: Record<
    string,
    string
  > = {};

  const linhas =
    texto
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

  for (const linha of linhas) {

    if (
      linha.includes(":")
    ) {

      const [
        chave,
        ...valor
      ] = linha.split(":");

      especificacoes[
        chave.trim()
      ] = valor
        .join(":")
        .trim();

    }

  }

  return {
    descricao: texto,
    especificacoes,
  };

}