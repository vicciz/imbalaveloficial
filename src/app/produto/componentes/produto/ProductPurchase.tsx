"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

import { Produto } from "@/src/services/produtos";
import { Button } from "@/src/components/ui/button";
import ProductPayments from "./ProductPayments";
type Props = {
  produto: Produto;

  variacao?: {
    variacaoSelecionada: any;
  };
};

export default function ProductPurchase({
  produto,
  variacao,
}: Props) {
  const [quantidade, setQuantidade] =
    useState(1);

  const estoque =
    variacao?.variacaoSelecionada
      ?.estoque ??
    produto.estoque ??
    0;

  const disponivel =
    estoque > 0;

  function aumentar() {
    if (quantidade < estoque) {
      setQuantidade((q) => q + 1);
    }
  }

  function diminuir() {
    if (quantidade > 1) {
      setQuantidade((q) => q - 1);
    }
  }

  return (
    <aside
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-8
        shadow-lg
      "
    >
      {/* ESTOQUE */}

      <div>

        <p className="text-sm text-slate-500">
          Estoque
        </p>

        <p
          className={`mt-2 text-lg font-semibold ${
            disponivel
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {disponivel
            ? `🟢 ${estoque} unidades disponíveis`
            : "🔴 Produto indisponível"}
        </p>

      </div>

      {/* DIVISOR */}

      <div className="my-6 border-t" />

      {/* FRETE */}

      <div>

        <p className="text-sm text-slate-500">
          Frete
        </p>

        <p className="mt-2 text-xl font-semibold">
          R$ 7,00
        </p>

        <p className="text-sm text-slate-500">
          Entrega entre 2 e 5 dias úteis
        </p>

      </div>

      {/* DEVOLUÇÃO */}

      <div
        className="
          mt-6
          rounded-xl
          bg-slate-50
          p-4
          text-center
        "
      >

        <p className="font-medium">
          <RotateCcw className="mr-2 inline h-4 w-4" />
          Devolução grátis
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Você possui até 30 dias após
          o recebimento para devolver.
        </p>

      </div>

      {/* DIVISOR */}

      <div className="my-6 border-t" />

      {/* QUANTIDADE */}

      <div className="flex justify-center">

        <div
          className="
            flex
            items-center
            overflow-hidden
            rounded-xl
            border
          "
        >

          <Button
            variant="ghost"
            size="icon"
            onClick={diminuir}
            disabled={quantidade <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <span
            className="
              w-14
              text-center
              font-semibold
            "
          >
            {quantidade}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={aumentar}
            disabled={
              quantidade >= estoque
            }
          >
            <Plus className="h-4 w-4" />
          </Button>

        </div>

      </div>

      {/* CARRINHO */}

      <Button
        variant="secondary"
        className="
          h-12
          w-full
          rounded-xl
          border
          border-slate-200
          bg-white
          text-slate-700
          font-medium
          shadow-sm
          transition-all
          hover:bg-slate-50
          hover:border-violet-500
          hover:text-violet-700
        "
      >
        <ShoppingCart className="mr-2 h-5 w-5" />

        Adicionar ao Carrinho
      </Button>

      {/* COMPRAR */}

      <Button
        disabled={!disponivel}
        className="
          mt-4
          h-14
          w-full
          rounded-xl
          bg-violet-600
          text-lg
          font-semibold
          shadow-lg
          transition
          hover:bg-violet-700
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {disponivel
          ? "Comprar Agora"
          : "Produto indisponível"}
      </Button>

      {/* PAGAMENTOS */}

      <div className="mt-8">

        <p
          className="
            mb-4
            text-center
            text-sm
            font-semibold
            text-green-600
          "
        >
          💚 5% de desconto via Pix
        </p>

        <div
          className="
            flex
            items-center
            justify-center
            gap-8
          "
        >

          <ProductPayments />

        </div>

      </div>

      {/* DIVISOR */}

      <div className="my-8 border-t" />

      {/* BENEFÍCIOS */}

      <div className="space-y-4">

        <div className="flex items-center gap-3">

          <ShieldCheck className="h-5 w-5 text-green-600" />

          <span className="text-sm">
            Compra 100% segura
          </span>

        </div>

        <div className="flex items-center gap-3">

          <Truck className="h-5 w-5 text-violet-600" />

          <span className="text-sm">
            Envio para todo o Brasil
          </span>

        </div>

        <div className="flex items-center gap-3">

          <RotateCcw className="h-5 w-5 text-blue-600" />

          <span className="text-sm">
            Troca facilitada em até 30 dias
          </span>

        </div>

      </div>

    </aside>
  );
}