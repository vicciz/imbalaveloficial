"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  atualizarQuantidadeCarrinho,
  buscarCarrinho,
  removerDoCarrinho,
} from "@/src/services/carrinho/cart";
import { Button } from "@/src/components/ui/button";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";
import { BackButton } from "@/src/navigation";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function CarrinhoP() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  function getAtributo(item: any, tipoNome: string) {
    const chave = tipoNome.trim().toLowerCase();

    return (
      item?.variacao?.produto_variacao_item
        ?.find(
          (registro: any) =>
            registro?.variacao_valor?.variacao_tipo?.nome
              ?.trim()
              .toLowerCase() === chave
        )
        ?.variacao_valor?.valor ?? "-"
    );
  }

  function getPrecoUnitario(item: any) {
    return Number(
      item?.variacao?.preco ?? item?.produto?.preco ?? 0
    );
  }

  function formatarCriadoEm(criadoEm?: string) {
    if (!criadoEm) return "-";

    const data = new Date(criadoEm);

    if (Number.isNaN(data.getTime())) return "-";

    const dataFormatada = data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const horaFormatada = data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${dataFormatada} às ${horaFormatada}`;
  }

  function getImagemItem(item: any) {
    const imagens = item?.produto?.produto_imagem ?? [];

    if (!imagens.length) {
      return item?.produto?.image ?? "/placeholder.png";
    }

    const itemCor = item?.variacao?.produto_variacao_item?.find(
      (registro: any) =>
        registro?.variacao_valor?.variacao_tipo?.nome
          ?.trim()
          .toLowerCase() === "cor"
    );

    if (itemCor?.id_valor != null) {
      const imagemCor = imagens
        .filter((img: any) => img.id_valor === itemCor.id_valor)
        .sort((a: any, b: any) => a.ordem - b.ordem)[0];

      if (imagemCor?.caminho) {
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/${imagemCor.caminho}`;
      }
    }

    const principal =
      imagens.find((img: any) => img.principal) ??
      imagens.sort((a: any, b: any) => a.ordem - b.ordem)[0];

    if (principal?.caminho) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/${principal.caminho}`;
    }

    return item?.produto?.image ?? "/placeholder.png";
  }

  async function carregarCarrinho() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await buscarCarrinho(user.id);

    if (error) {
      console.error(error);
      setLoading(false);
      toast.error("Não foi possível carregar o carrinho.");
      return;
    }

    const itens = data || [];

    setCartItems(itens);
    setSelectedItemIds((prev) => {
      const idsExistentes = new Set(itens.map((item: any) => Number(item.id)));

      return prev.filter((id) => idsExistentes.has(id));
    });
    setLoading(false);
  }

  useEffect(() => {
    carregarCarrinho();
  }, []);

  const finalizarCompra = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Não foi possível finalizar a compra.", {
          description: "Faça login para continuar.",
        });
        return;
      }

      if (!selectedItemIds.length) {
        toast.error("Selecione ao menos um item para finalizar a compra.");
        return;
      }

      const response = await fetch(
        "/stripe/checkout-carrinho",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            selectedItemIds,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        toast.error(data.error || "Não foi possível finalizar a compra.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível finalizar a compra.");
    }
  };

  async function handleRemover(id: number) {
    setUpdatingIds((prev) => [...prev, id]);

    const ok = await removerDoCarrinho(id);

    if (ok) {
      setSelectedItemIds((prev) => prev.filter((itemId) => itemId !== id));
      await carregarCarrinho();
      toast.success("Item removido do carrinho.");
    } else {
      toast.error("Não foi possível remover o item.");
    }

    setUpdatingIds((prev) => prev.filter((itemId) => itemId !== id));
  }

  async function alterarQuantidade(item: any, delta: number) {
    const id = Number(item?.id);
    const quantidadeAtual = Number(item?.quantidade ?? 0);
    const novaQuantidade = quantidadeAtual + delta;

    setUpdatingIds((prev) => [...prev, id]);

    if (novaQuantidade <= 0) {
      const ok = await removerDoCarrinho(id);

      if (!ok) {
        toast.error("Não foi possível atualizar a quantidade.");
      } else {
        toast.success("Item removido do carrinho.");
      }

      setSelectedItemIds((prev) => prev.filter((itemId) => itemId !== id));
      await carregarCarrinho();
      setUpdatingIds((prev) => prev.filter((itemId) => itemId !== id));
      return;
    }

    const { error } = await atualizarQuantidadeCarrinho(id, novaQuantidade);

    if (error) {
      toast.error("Não foi possível atualizar a quantidade.");
      console.error(error);
      setUpdatingIds((prev) => prev.filter((itemId) => itemId !== id));
      return;
    }

    await carregarCarrinho();
    setUpdatingIds((prev) => prev.filter((itemId) => itemId !== id));
  }

  function alternarSelecaoItem(id: number) {
    setSelectedItemIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      }

      return [...prev, id];
    });
  }

  function alternarSelecionarTodos() {
    const todosIds = cartItems.map((item) => Number(item.id));
    const todosSelecionados =
      todosIds.length > 0 && todosIds.every((id) => selectedItemIds.includes(id));

    setSelectedItemIds(todosSelecionados ? [] : todosIds);
  }

  const itensSelecionados = cartItems.filter((item) =>
    selectedItemIds.includes(Number(item.id))
  );

  const todosSelecionados =
    cartItems.length > 0 &&
    cartItems.every((item) => selectedItemIds.includes(Number(item.id)));

  const quantidadeSelecionados = itensSelecionados.length;

  const totalItens = cartItems.reduce((acc, item) => {
    const quantidade = Number(item.quantidade ?? 0);

    return acc + quantidade;
  }, 0);

  const total = cartItems.reduce((acc, item) => {
    const preco = getPrecoUnitario(item);
    const quantidade = Number(item.quantidade ?? 0);

    return acc + preco * quantidade;
  }, 0);

  const subtotalSelecionados = itensSelecionados.reduce((acc, item) => {
    const preco = getPrecoUnitario(item);
    const quantidade = Number(item.quantidade ?? 0);

    return acc + preco * quantidade;
  }, 0);

  const mostrarAvisoSelecao =
    quantidadeSelecionados === 0 && cartItems.length > 0;

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
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={todosSelecionados}
                    onChange={alternarSelecionarTodos}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  Selecionar todos
                </label>

                <span className="text-sm font-semibold text-slate-700">
                  {quantidadeSelecionados} itens selecionados
                </span>
              </div>
            )}

            {cartItems.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
                Seu carrinho está vazio.
              </div>
            ) : (
              cartItems.map((item) => {
                const cor = getAtributo(item, "cor");
                const modelo = getAtributo(item, "modelo");
                const voltagem = getAtributo(item, "voltagem");
                const precoUnitario = getPrecoUnitario(item);
                const quantidade = Number(item?.quantidade ?? 0);
                const subtotal = precoUnitario * quantidade;
                const atualizando = updatingIds.includes(item.id);

                return (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(Number(item.id))}
                          onChange={() => alternarSelecaoItem(Number(item.id))}
                          className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          aria-label={`Selecionar ${item?.produto?.nome ?? "produto"}`}
                        />
                      </div>

                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <Image
                          src={getImagemItem(item)}
                          alt={item?.produto?.nome ?? "Produto"}
                          fill
                          className="object-contain"
                        />
                      </div>

                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {item?.produto?.nome ?? "Produto indisponível"}
                        </h2>

                        <div className="mt-1 grid gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2">
                          <p>Cor: {cor}</p>
                          <p>Modelo: {modelo}</p>
                          <p>Voltagem: {voltagem}</p>
                          <p>SKU: {item?.variacao?.sku ?? "-"}</p>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Adicionado em: {formatarCriadoEm(item?.criado_em)}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <div className="flex items-center overflow-hidden rounded-lg border border-slate-300">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={atualizando}
                              onClick={() => alterarQuantidade(item, -1)}
                              className="h-9 w-9 rounded-none"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>

                            <span className="w-10 text-center text-sm font-semibold text-slate-900">
                              {quantidade}
                            </span>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={atualizando}
                              onClick={() => alterarQuantidade(item, 1)}
                              className="h-9 w-9 rounded-none"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            type="button"
                            variant="destructive"
                            disabled={atualizando}
                            onClick={() => handleRemover(item.id)}
                            className="h-9"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </Button>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-sm text-slate-600">
                          Preço unitário
                        </p>
                        <p className="text-base font-semibold text-slate-900">
                          {formatCurrency(precoUnitario)}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          Subtotal
                        </p>
                        <p className="text-lg font-bold text-slate-900">
                          {formatCurrency(subtotal)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Resumo do pedido
            </h2>

            <div className="mt-4 space-y-2 border-b border-slate-200 pb-4 text-sm">
              <div className="flex items-center justify-between text-slate-700">
                <span>Quantidade total de itens</span>
                <span className="font-semibold text-slate-900">{totalItens}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span>Itens selecionados</span>
                <span className="font-semibold text-slate-900">{quantidadeSelecionados}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span>Valor total do carrinho</span>
                <span className="font-semibold text-slate-900">{formatCurrency(total)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span>Subtotal dos selecionados</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotalSelecionados)}</span>
              </div>
            </div>

            <div className="mt-3 min-h-5">
              <p
                className={`text-sm transition-opacity ${
                  mostrarAvisoSelecao
                    ? "visible text-amber-700 opacity-100"
                    : "invisible text-transparent opacity-0"
                }`}
              >
                Selecione ao menos um item para finalizar a compra.
              </p>
            </div>

            <div className="mt-4 grid gap-2">
              <BackButton
                label="Continuar comprando"
              />

              <Button
                type="button"
                onClick={finalizarCompra}
                disabled={cartItems.length === 0 || quantidadeSelecionados === 0}
              >
                Finalizar compra
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}