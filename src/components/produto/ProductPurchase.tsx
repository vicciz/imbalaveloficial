"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

import { Produto } from "@/src/services/produto/produtos";
import { Button } from "@/src/components/ui/button";
import { supabase } from "@/supabaseClient";
import {
  adicionarAoCarrinho,
  buscarCarrinho,
} from "@/src/services/carrinho/cart";
import { toast } from "sonner";
import ProductPayments from "./ProductPayments";
import { useNavigation } from "@/src/navigation";
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
  const { goCart } = useNavigation();
  const [itensCarrinho, setItensCarrinho] =
    useState<any[]>([]);
  const [carregandoCarrinho, setCarregandoCarrinho] =
    useState(false);
  const [quantidade, setQuantidade] =
    useState(1);
  const [comprando, setComprando] =
    useState(false);

  const estoque =
    variacao?.variacaoSelecionada
      ?.estoque ??
    produto.estoque ??
    0;

  const disponivel =
    estoque > 0;

  useEffect(() => {
    carregarCarrinhoAtual();
  }, []);

  function getAtributo(
    item: any,
    tipoNome: string
  ) {
    const chave = tipoNome.trim().toLowerCase();

    return (
      item?.variacao?.produto_variacao_item
        ?.find(
          (registro: any) =>
            registro?.variacao_valor?.variacao_tipo?.nome
              ?.trim()
              .toLowerCase() === chave
        )
        ?.variacao_valor?.valor ?? ""
    );
  }

  function getAtributoSelecionado(tipoNome: string) {
    const chave = tipoNome.trim().toLowerCase();

    return (
      variacao?.variacaoSelecionada?.produto_variacao_item
        ?.find(
          (registro: any) =>
            registro?.variacao_valor?.variacao_tipo?.nome
              ?.trim()
              .toLowerCase() === chave
        )
        ?.variacao_valor?.valor ?? ""
    );
  }

  function getPrecoUnitario(item: any) {
    return Number(
      item?.variacao?.preco ?? item?.produto?.preco ?? 0
    );
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function logCarrinhoAtual(itens: any[]) {
    const quantidadeTotal = itens.reduce(
      (acc, item) =>
        acc + Number(item?.quantidade ?? 0),
      0
    );

    const total = itens.reduce(
      (acc, item) =>
        acc +
        getPrecoUnitario(item) *
          Number(item?.quantidade ?? 0),
      0
    );

    console.log("CARRINHO ATUAL");

    itens.forEach((item, index) => {
      const cor = getAtributo(item, "cor");
      const modelo = getAtributo(item, "modelo");
      const voltagem = getAtributo(item, "voltagem");
      const precoUnitario = getPrecoUnitario(item);
      const subtotal =
        precoUnitario * Number(item?.quantidade ?? 0);

      console.log(`Item ${index + 1}`);
      console.log("Produto:", item?.produto?.nome ?? "");
      console.log("Variação:", item?.id_variacao ?? "");
      console.log("Cor:", cor);
      console.log("Modelo:", modelo);
      console.log("Voltagem:", voltagem);
      console.log("Quantidade:", Number(item?.quantidade ?? 0));
      console.log("Preço Unitário:", formatCurrency(precoUnitario));
      console.log("Subtotal:", formatCurrency(subtotal));
    });

    console.log("Quantidade total de itens:", quantidadeTotal);
    console.log("Valor total do carrinho:", formatCurrency(total));
  }

  async function carregarCarrinhoAtual() {
    try {
      setCarregandoCarrinho(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setItensCarrinho([]);
        return;
      }

      const { data, error } =
        await buscarCarrinho(user.id);

      if (error) {
        console.error(error);
        setItensCarrinho([]);
        return;
      }

      setItensCarrinho(data ?? []);
      logCarrinhoAtual(data ?? []);
    } catch (error) {
      console.error(error);
      setItensCarrinho([]);
    } finally {
      setCarregandoCarrinho(false);
    }
  }

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

  async function comprarAgora() {
    try {
      const temVariacoes =
        Array.isArray((variacao as any)?.variacoes) &&
        (variacao as any).variacoes.length > 0;

      if (
        temVariacoes &&
        !variacao?.variacaoSelecionada
      ) {
        alert(
          "Selecione uma variação antes de continuar."
        );
        return;
      }

      if (!produto?.id) {
        alert("Produto inválido para checkout.");
        return;
      }

      setComprando(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const response = await fetch(
        "/stripe/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: produto.id,
            quantidade,
            userId: user?.id ?? "",
            variacaoSelecionada:
              variacao?.variacaoSelecionada ??
              null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.url) {
        alert(
          data?.error ||
            "Erro ao iniciar checkout"
        );
        setComprando(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Erro ao iniciar checkout");
      setComprando(false);
    }
  }

  async function adicionarCarrinho() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Não foi possível adicionar o produto ao carrinho.", {
          description: "Faça login para adicionar itens ao carrinho.",
        });
        return;
      }

      const temVariacoes =
        Array.isArray((variacao as any)?.variacoes) &&
        (variacao as any).variacoes.length > 0;

      if (
        temVariacoes &&
        !variacao?.variacaoSelecionada
      ) {
        toast.error("Não foi possível adicionar o produto ao carrinho.", {
          description: "Selecione uma variação antes de continuar.",
        });
        return;
      }

      const idVariacao =
        variacao?.variacaoSelecionada?.id ?? null;

      await adicionarAoCarrinho(
        produto.id,
        user.id,
        quantidade,
        idVariacao
      );

      const detalhes = [
        getAtributoSelecionado("cor"),
        getAtributoSelecionado("modelo"),
        getAtributoSelecionado("voltagem"),
      ].filter(Boolean);

      toast.success("Produto adicionado ao carrinho", {
        description: [produto.nome, ...detalhes].join(" • "),
        action: {
          label: "Ver carrinho",
          onClick: goCart,
        },
      });

      await carregarCarrinhoAtual();
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível adicionar o produto ao carrinho.");
    }
  }

  const quantidadeTotalItens = itensCarrinho.reduce(
    (acc, item) => acc + Number(item?.quantidade ?? 0),
    0
  );

  const totalCarrinho = itensCarrinho.reduce(
    (acc, item) =>
      acc +
      getPrecoUnitario(item) * Number(item?.quantidade ?? 0),
    0
  );

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
        onClick={adicionarCarrinho}
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
        disabled={!disponivel || comprando}
        onClick={comprarAgora}
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
        {comprando
          ? "Redirecionando..."
          : disponivel
          ? "Comprar Agora"
          : "Produto indisponível"}
      </Button>

      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-base font-semibold text-slate-900">
          Resumo do carrinho
        </h3>

        {carregandoCarrinho ? (
          <p className="mt-3 text-sm text-slate-500">
            Carregando resumo...
          </p>
        ) : (
          <div className="mt-3 text-sm text-slate-500">
            Resumo atualizado com base nos itens salvos no carrinho.
          </div>
        )}

        <div className="mt-4 border-t border-slate-200 pt-3 text-sm">
          <p className="text-slate-700">
            Quantidade total de itens: <span className="font-semibold text-slate-900">{quantidadeTotalItens}</span>
          </p>
          <p className="text-slate-700">
            Valor total do carrinho: <span className="font-semibold text-slate-900">{formatCurrency(totalCarrinho)}</span>
          </p>
        </div>
      </div>

      <Link
        href="/carrinho"
        className="mt-3 inline-flex text-sm font-semibold text-violet-700 transition hover:text-violet-800 hover:underline"
      >
        Visualizar carrinho
      </Link>

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
