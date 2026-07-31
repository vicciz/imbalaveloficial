"use client";

import { Button } from "@/src/components/ui/button";
import { BackButton } from "@/src/navigation";

type CartSummaryProps = {
  totalItens: number;
  quantidadeSelecionados: number;
  total: number;
  subtotalSelecionados: number;
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
  mostrarAvisoSelecao,
  disabled,
  onCheckout,
}: CartSummaryProps) {
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
          <span className="font-semibold">
            {quantidadeSelecionados}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Valor total do carrinho</span>
          <span className="font-semibold">
            {formatCurrency(total)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Subtotal dos selecionados</span>
          <span className="font-semibold">
            {formatCurrency(subtotalSelecionados)}
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
      </div>

      <div className="mt-4 grid gap-2">
        <BackButton label="Continuar comprando" />

        <Button
          type="button"
          onClick={onCheckout}
          disabled={disabled}
        >
          Finalizar compra
        </Button>
      </div>
    </aside>
  );
}