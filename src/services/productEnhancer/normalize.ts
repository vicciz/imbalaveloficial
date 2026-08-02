const aliases: Record<string, string> = {
  resolution: "Resolução",
  "screen size": "Tamanho da tela",
  display: "Tela",
  "display size": "Tamanho da tela",
  voltage: "Tensão",
  power: "Potência",
  weight: "Peso",
  material: "Material",
  color: "Cor",
  colour: "Cor",
  size: "Tamanho",
  interface: "Interface",
  connector: "Conector",
  input: "Entrada",
  output: "Saída",
  compatibility: "Compatibilidade",
  compatible: "Compatibilidade",
  package: "Conteúdo da embalagem",
};

export function normalizeSpecs(
  specs: Record<string, string>
) {
  const resultado: Record<
    string,
    string
  > = {};

  for (const [chave, valor] of Object.entries(specs)) {

    const key =
      chave
        .trim()
        .toLowerCase();

    resultado[
      aliases[key] ??
      chave.trim()
    ] = valor.trim();

  }

  return resultado;
}