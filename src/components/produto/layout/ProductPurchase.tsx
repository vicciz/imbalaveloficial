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

import { Produto } from "@/src/components/produto/types/produtos";
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
  const [cepFrete, setCepFrete] = useState("");
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [frete, setFrete] = useState<any | null>(null);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [enderecos, setEnderecos] = useState<any[]>([]);
  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState<number | null>(null);
  const [carregandoEndereco, setCarregandoEndereco] = useState(true);
  
  const estoque =
    Number(
      variacao?.variacaoSelecionada?.estoque ??
      produto.estoque ??
      0
    );

  // In dropshipping, local stock may legitimately be zero because the item
  // is held by the supplier. A valid supplier SKU/VID is the availability
  // signal until supplier stock synchronization says otherwise.
  const origemProduto = String(produto.origem ?? "").trim().toLowerCase();
  const fornecedorSku =
    variacao?.variacaoSelecionada?.item?.fornecedor_sku ??
    variacao?.variacaoSelecionada?.fornecedor_sku ??
    null;

  const eDropshipping =
    origemProduto === "cj" ||
    Boolean(fornecedorSku) ||
    Boolean(produto.id_fornecedor);

  const disponivel =
    eDropshipping
      ? Boolean(
          variacao?.variacaoSelecionada
            ? variacao?.variacaoSelecionada?.item?.ativo !== false &&
              (fornecedorSku || variacao?.variacaoSelecionada?.sku)
            : produto.id_fornecedor || produto.origem
        )
      : estoque > 0;

  const limiteQuantidade =
    eDropshipping && estoque <= 0
      ? 99
      : Math.max(1, estoque);

  useEffect(() => {
    carregarCarrinhoAtual();
    carregarEnderecoParaFrete();
  }, []);

  async function carregarEnderecoParaFrete() {
    try {
      setCarregandoEndereco(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUsuarioLogado(false);
        setEnderecos([]);
        setEnderecoSelecionadoId(null);
        return;
      }

      setUsuarioLogado(true);

      // A tabela `enderecos` usa o ID interno da tabela `usuario`,
      // não o UUID do Supabase Auth.
      const { data: perfil, error: perfilError } = await supabase
        .from("usuario")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (perfilError || !perfil?.id) {
        console.error("Erro ao localizar perfil do usuário:", perfilError);
        return;
      }

      const { data, error } = await supabase
        .from("enderecos")
        .select("*")
        .eq("id_usuario", perfil.id)
        .order("principal", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erro ao carregar endereços:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        return;
      }

      const lista = data ?? [];
      setEnderecos(lista);

      const principal = lista.find((endereco: any) => endereco.principal === true);
      const escolhido = principal ?? lista[0];

      if (escolhido?.id) {
        setEnderecoSelecionadoId(Number(escolhido.id));
        setCepFrete(String(escolhido.cep ?? ""));
      }
    } catch (error) {
      console.error("Erro ao carregar endereço para frete:", error);
    } finally {
      setCarregandoEndereco(false);
    }
  }

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
      item?.variacao?.produto_variacao_item?.[0]?.preco ??
      item?.produto?.preco ??
      0
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
    if (quantidade < limiteQuantidade) {
      setQuantidade((q) => q + 1);
    }
  }

  function diminuir() {
    if (quantidade > 1) {
      setQuantidade((q) => q - 1);
    }
  }

  async function calcularFreteAutomaticamente(cep: string) {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setFrete(null);
      return;
    }

    try {
      setCalculandoFrete(true);

      const response = await fetch("/api/frete/cotacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produtoId: produto.id,
          quantidade,
          cepDestino: cepLimpo,
          preco: Number(
            variacao?.variacaoSelecionada?.item?.preco ??
            variacao?.variacaoSelecionada?.preco ??
            produto.preco ??
            0
          ),
          variantId:
            variacao?.variacaoSelecionada?.cj_variant_id ??
            variacao?.variacaoSelecionada?.item?.cj_variant_id ??
            variacao?.variacaoSelecionada?.item?.fornecedor_sku ??
            variacao?.variacaoSelecionada?.fornecedor_sku ??
            null,
          variantSku: variacao?.variacaoSelecionada?.sku ?? null,
          variantItemId:
            variacao?.variacaoSelecionada?.item?.id ??
            null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFrete(null);
        toast.error("Não foi possível calcular o frete.", {
          description: data?.error ?? "Tente novamente.",
        });
        return;
      }

      setFrete(data.selected ?? null);
    } catch (error) {
      console.error("Erro ao calcular frete automaticamente:", error);
      setFrete(null);
      toast.error("Não foi possível calcular o frete.");
    } finally {
      setCalculandoFrete(false);
    }
  }

  // Recalcula automaticamente quando o CEP, quantidade ou variante mudarem.
  useEffect(() => {
    const cepLimpo = cepFrete.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setFrete(null);
      return;
    }

    const timer = window.setTimeout(() => {
      calcularFreteAutomaticamente(cepLimpo);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [
    cepFrete,
    quantidade,
    variacao?.variacaoSelecionada?.item?.id,
    variacao?.variacaoSelecionada?.item?.fornecedor_sku,
  ]);

  function selecionarEndereco(id: number) {
    const endereco = enderecos.find(
      (item) => Number(item.id) === Number(id)
    );

    if (!endereco) return;

    setEnderecoSelecionadoId(Number(endereco.id));
    setCepFrete(String(endereco.cep ?? ""));
    setFrete(null);
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

      console.log("VARIAÇÃO SELECIONADA:");
      console.log(variacao?.variacaoSelecionada);

      console.log("ITEM:");
      console.log(variacao?.variacaoSelecionada?.item);

      console.log("PREÇO:");
      console.log(variacao?.variacaoSelecionada?.item?.preco);
      
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
            cepDestino: cepFrete,
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

     const idItemVariacao =
       variacao?.variacaoSelecionada?.item?.id ?? null;

        await adicionarAoCarrinho(
            produto.id,
            user.id,
            quantidade,
            idItemVariacao
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
            ? eDropshipping && estoque <= 0
              ? "🟢 Disponível para envio"
              : `🟢 ${estoque} unidades disponíveis`
            : "🔴 Produto indisponível"}
        </p>

      </div>

      {/* DIVISOR */}

      <div className="my-6 border-t" />

      {/* FRETE */}

      <div>
        {String(produto.origem ?? "").toLowerCase() === "cj" && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-900">
              Envio internacional
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              Este produto é enviado pela logística da CJ. A origem do envio será definida conforme o warehouse disponível para a variante.
            </p>
          </div>
        )}

        <p className="text-sm text-slate-500">
          Frete
        </p>

        {usuarioLogado && enderecos.length > 0 ? (
          <div className="mt-2 space-y-2">
            {enderecos.length > 1 ? (
              <select
                value={enderecoSelecionadoId ?? ""}
                onChange={(event) =>
                  selecionarEndereco(Number(event.target.value))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500"
                disabled={carregandoEndereco || calculandoFrete}
              >
                {enderecos.map((endereco) => (
                  <option key={endereco.id} value={endereco.id}>
                    {endereco.principal ? "Principal — " : ""}
                    {endereco.logradouro ?? "Endereço"}{" "}
                    {endereco.numero ?? ""} — {endereco.cidade ?? ""}/{endereco.estado ?? ""}
                    {" — CEP "}
                    {endereco.cep ?? ""}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <p className="font-medium">
                  Entrega para {enderecos[0]?.cidade ?? ""}/{enderecos[0]?.estado ?? ""}
                </p>
                <p className="text-xs text-slate-500">
                  CEP {String(enderecos[0]?.cep ?? "")}
                </p>
              </div>
            )}

            {calculandoFrete && (
              <p className="text-xs text-slate-500">
                Calculando frete para este endereço...
              </p>
            )}
          </div>
        ) : usuarioLogado && !carregandoEndereco ? (
          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Você ainda não possui um endereço cadastrado.{" "}
            <Link
              href="/perfil"
              className="font-semibold underline"
            >
              Cadastrar endereço
            </Link>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <input
              value={cepFrete}
              onChange={(event) => setCepFrete(event.target.value)}
              inputMode="numeric"
              maxLength={9}
              placeholder="Digite seu CEP"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
            {calculandoFrete && (
              <span className="self-center whitespace-nowrap text-xs text-slate-500">
                Calculando...
              </span>
            )}
          </div>
        )}

        {frete ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            {frete.international && (
              <p className="font-semibold text-amber-800">
                Envio internacional
              </p>
            )}
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="text-sm text-slate-600">
                {frete.serviceName}
              </span>
              <span className="font-semibold text-slate-900">
                {Number(frete.priceBRL ?? frete.price).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
            {frete.international && frete.currency === "USD" && (
              <p className="mt-1 text-xs text-slate-500">
                {Number(frete.price).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })} convertido pela cotação atual do USD/BRL.
              </p>
            )}
            {frete.deliveryTime && (
              <p className="mt-1 text-xs text-slate-500">
                Prazo estimado: {frete.deliveryTime}
              </p>
            )}
            {frete.international && frete.originCountryName && (
              <p className="mt-1 text-xs text-slate-500">
                Origem: {frete.originCountryName}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            {usuarioLogado
              ? "Selecione um endereço para consultar as opções de entrega."
              : "Informe seu CEP para consultar as opções de entrega."}
          </p>
        )}
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
              quantidade >= limiteQuantidade
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
