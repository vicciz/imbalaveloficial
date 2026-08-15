export const MARKUP_PADRAO_PERCENTUAL = 50;

export function normalizarMarkup(markup: unknown): number {
  const valor = Number(markup);
  return Number.isFinite(valor) && valor >= 0
    ? valor
    : MARKUP_PADRAO_PERCENTUAL;
}

export function calcularPrecoVenda(
  custoFornecedor: unknown,
  markupPercentual: unknown = MARKUP_PADRAO_PERCENTUAL
): number {
  const custo = Number(custoFornecedor ?? 0);
  if (!Number.isFinite(custo) || custo < 0) return 0;

  const markup = normalizarMarkup(markupPercentual);
  return Number((custo * (1 + markup / 100)).toFixed(2));
}
