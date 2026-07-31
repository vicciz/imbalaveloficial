"use client";

export function useCartTotals(
  cartItems: any[],
  selectedItemIds: number[],
  getPrecoUnitario: (item: any) => number
) {

  const itensSelecionados =
    cartItems.filter((item) =>
      selectedItemIds.includes(Number(item.id))
    );

  const todosSelecionados =
    cartItems.length > 0 &&
    cartItems.every((item) =>
      selectedItemIds.includes(Number(item.id))
    );

  const quantidadeSelecionados =
    itensSelecionados.length;

  const totalItens =
    cartItems.reduce((acc, item) => {
      return (
        acc +
        Number(item.quantidade ?? 0)
      );
    }, 0);

  const total =
    cartItems.reduce((acc, item) => {

      const preco =
        getPrecoUnitario(item);

      return (
        acc +
        preco *
          Number(item.quantidade ?? 0)
      );

    }, 0);

  const subtotalSelecionados =
    itensSelecionados.reduce((acc, item) => {

      const preco =
        getPrecoUnitario(item);

      return (
        acc +
        preco *
          Number(item.quantidade ?? 0)
      );

    }, 0);

  const mostrarAvisoSelecao =
    quantidadeSelecionados === 0 &&
    cartItems.length > 0;

  return {

    itensSelecionados,

    todosSelecionados,

    quantidadeSelecionados,

    totalItens,

    total,

    subtotalSelecionados,

    mostrarAvisoSelecao,

  };

}