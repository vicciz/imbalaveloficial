import type { ProductSpecification } from "../types/ProductSpecification";

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
  specifications: ProductSpecification[]
): ProductSpecification[] {
  return specifications.map((specification, index) => {
    const normalizedKey = specification.name.trim().toLowerCase();

    return {
      ...specification,
      name: aliases[normalizedKey] ?? specification.name.trim(),
      value: specification.value.trim(),
      order: specification.order ?? index,
    };
  });
}
