"use client";

import {useState } from "react";
import { BackButton } from "@/src/navigation";
import { SelectAddress } from "./componentes/SelectAndress";
import { CartSummary } from "./componentes/CartSumary";
import { CartHeader } from "./componentes/CartHeader";
import { useCart } from "./hooks/useCart";
import { ArticleCart } from "./componentes/ArticleCart";
import { useCheckout } from "./hooks/useCheckout";
import { useCartTotals } from "./hooks/useCartTotals";
import { obterAtributos } from "@/src/components/produto/variacoes/helpers/variacao";
import { useFreteCarrinho } from "./hooks/useFreteCarrinho";

export default function Carrinho() {
  const [enderecoId, setEnderecoId] = useState<number | null>(null);

const {
  cartItems,
  loading,
  updatingIds,
  selectedItemIds,
  remover,
  alterarQuantidade,
  alternarSelecaoItem,
  alternarSelecionarTodos,
  getImagemItem,
  getPrecoUnitario,
} = useCart();

  const {
  todosSelecionados,
  quantidadeSelecionados,
  totalItens,
  total,
  subtotalSelecionados,
  mostrarAvisoSelecao,
} = useCartTotals(
  cartItems,
  selectedItemIds,
  getPrecoUnitario
);
  const { finalizarCompra } = useCheckout({
    enderecoId,
    selectedItemIds,
  });

  const { total: freteTotal, loading: freteLoading, error: freteError } =
    useFreteCarrinho({
      itens: cartItems,
      selectedItemIds,
      enderecoId,
    });

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-lg font-semibold text-slate-900">Carregando carrinho...</h1>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <BackButton
          label="Voltar"
          className="mb-4"
        />

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Carrinho de compras
        </h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {cartItems.length > 0 && (
              <CartHeader
                checked={todosSelecionados}
                selected={quantidadeSelecionados}
                onChange={alternarSelecionarTodos}
              />
            )}

          {cartItems.map((item) => {
            const atributos = obterAtributos(item.variacao);

            const precoUnitario = getPrecoUnitario(item);

            const quantidade = Number(item.quantidade);

            const subtotal =
              precoUnitario * quantidade;

            return (

              <ArticleCart
                key={item.id}
                item={item}
                imagem={getImagemItem(item)}
                atributos={atributos}
                quantidade={quantidade}
                precoUnitario={precoUnitario}
                subtotal={subtotal}
                selecionado={selectedItemIds.includes(Number(item.id))}
                atualizando={updatingIds.includes(Number(item.id))}
                onSelecionar={() =>
                  alternarSelecaoItem(Number(item.id))
                }
                onAumentar={() =>
                  alterarQuantidade(item, 1)
                }
                onDiminuir={() =>
                  alterarQuantidade(item, -1)
                }
                onRemover={() =>
                  remover(item.id)
                }
              />
            );
          })}
          </div>
          <div className="space-y-4">
            <SelectAddress
              value={enderecoId}
              onChange={setEnderecoId}
            />
            <CartSummary
            totalItens={totalItens}
            quantidadeSelecionados={quantidadeSelecionados}
            total={total}
            subtotalSelecionados={subtotalSelecionados}
            frete={freteTotal}
            freteLoading={freteLoading}
            freteError={freteError}
            mostrarAvisoSelecao={mostrarAvisoSelecao}
            disabled={
              cartItems.length === 0 ||
              quantidadeSelecionados === 0 ||
              !enderecoId
            }
            onCheckout={finalizarCompra}
          />
          </div>
         
        </div>

      </section>
    </main>
  );
}