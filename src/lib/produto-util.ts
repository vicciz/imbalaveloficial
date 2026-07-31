export function obterMenorPreco(produto: any): number | null {
  const itens =
    produto?.produto_variacao?.flatMap(
      (v: any) => v.produto_variacao_item ?? []
    ) ?? [];

  if (!itens.length) return null;

  return Math.min(
    ...itens.map((item: any) => Number(item.preco))
  );
}

export function obterMaiorPreco(produto: any): number | null {
  const itens =
    produto?.produto_variacao?.flatMap(
      (v: any) => v.produto_variacao_item ?? []
    ) ?? [];

  if (!itens.length) return null;

  return Math.max(
    ...itens.map((item: any) => Number(item.preco))
  );
}

export function formatarPreco(valor: number | null) {
  if (valor == null) return "-";

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}