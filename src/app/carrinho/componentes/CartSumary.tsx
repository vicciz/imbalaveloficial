"use client";

import { Button } from "@/src/components/ui/button";
import { BackButton } from "@/src/navigation";

export type CartSummaryProps = {
  totalItens: number;
  quantidadeSelecionados: number;
  total: number;
  subtotalSelecionados: number;
  frete: number;
  freteLoading: boolean;
  freteError: string | null;
  mostrarAvisoSelecao: boolean;
  disabled: boolean;
  onCheckout: () => void;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export function CartSummary({
  totalItens,
  quantidadeSelecionados,
  total,
  subtotalSelecionados,
  frete,
  freteLoading,
  freteError,
  mostrarAvisoSelecao,
  disabled,
  onCheckout,
}: CartSummaryProps) {
  const totalComFrete = subtotalSelecionados + frete;

  return (
    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Resumo do pedido
      </h2>

      <div className="mt-4 space-y-2 border-b border-slate-200 pb-4 text-sm">
        <div className="flex items-center justify-between">
          <span>Quantidade total de itens</span>
          <span className="font-semibold">{totalItens}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Itens selecionados</span>
          <span className="font-semibold">{quantidadeSelecionados}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Valor total do carrinho</span>
          <span className="font-semibold">{formatCurrency(total)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Subtotal dos selecionados</span>
          <span className="font-semibold">
            {formatCurrency(subtotalSelecionados)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Frete</span>
          <span className="font-semibold">
            {freteLoading
              ? "Calculando..."
              : freteError
                ? "Indisponível"
                : formatCurrency(frete)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 text-base">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-violet-700">
            {formatCurrency(totalComFrete)}
          </span>
        </div>
      </div>

      <div className="mt-3 min-h-5">
        <p
          className={`text-sm transition-opacity ${
            mostrarAvisoSelecao
              ? "visible text-amber-700 opacity-100"
              : "invisible opacity-0"
          }`}
        >
          Selecione ao menos um item para finalizar a compra.
        </p>

        {freteError && quantidadeSelecionados > 0 && (
          <p className="mt-2 text-sm text-red-600">{freteError}</p>
        )}
      </div>

      <div className="mt-4 grid gap-2">
        <BackButton label="Continuar comprando" />

        <Button
          type="button"
          onClick={onCheckout}
          disabled={disabled || freteLoading || Boolean(freteError)}
        >
          Finalizar compra
        </Button>
      </div>
    </aside>
  );
}
