"use client";

type ItemPriceProps = {
  preco: number;
  subtotal: number;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export function ItemPrice({
  preco,
  subtotal,
}: ItemPriceProps) {
  return (
    <div className="text-left sm:text-right">
      <p className="text-sm text-slate-600">
        Preço unitário
      </p>

      <p className="text-base font-semibold text-slate-900">
        {formatCurrency(preco)}
      </p>

      <p className="mt-2 text-sm text-slate-600">
        Subtotal
      </p>

      <p className="text-lg font-bold text-slate-900">
        {formatCurrency(subtotal)}
      </p>
    </div>
  );
}