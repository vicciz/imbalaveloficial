import Stripe from "stripe";
import { supabase } from "../../../supabaseClient";
import { variantImageService } from "@/src/services/products/services/VariantImageService";
import { calcularFreteCarrinho, calcularFreteProduto } from "@/src/services/frete/calcularFrete";
import { getUsdBrlRate } from "@/src/services/cambio/usdBrl";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY não configurada");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
});

type ProdutoImagem = {
  id: number;
  caminho: string;
  principal: boolean;
  ordem: number;
  id_valor?: number | null;
};

type Produto = {
  id?: number;
  nome: string;
  preco?: number | null;
  origem?: string | null;
  origem_pais_codigo?: string | null;
  id_fornecedor?: number | null;
  warehouse_id?: string | null;
  warehouse_nome?: string | null;
  origem_cep?: string | null;
  peso_kg?: number | null;
  comprimento_cm?: number | null;
  largura_cm?: number | null;
  altura_cm?: number | null;
  produto_imagem?: ProdutoImagem[];
};

type VariacaoSelecionada = {
  id: number;
  external_variant_id?: string | null;
  produto_variacao_imagem?: Array<{
    id: number;
    id_variacao: number;
    id_imagem: number;
  }>;
  produto_variacao_item: Array<{
    id: number;
    sku: string | null;
    preco: number;
    estoque: number;
    ativo: boolean;
    fornecedor_sku?: string | null;
    id_valor?: number | null;
    variacao_valor?: {
      valor?: string;
      variacao_tipo?: {
        nome?: string;
      };
    };
  }>;
};

type ItemCarrinho = {
  id: number;
  id_produto?: number;
  id_variacao?: number | null;
  quantidade: number | string;
  produto: Produto;
  variacao?: VariacaoSelecionada | null;
};

async function carregarVariacao(idVariacao: number): Promise<VariacaoSelecionada | null> {
  const { data } = await supabase
    .from("produto_variacao")
    .select(`
      id,
      external_variant_id,
      produto_variacao_item (
        id,
        sku,
        preco,
        estoque,
        ativo,
        fornecedor_sku,
        id_valor,
        variacao_valor (
          valor,
          variacao_tipo (
            nome
          )
        )
      )
    `)
    .eq("id", idVariacao)
    .maybeSingle();

  return data as VariacaoSelecionada | null;
}

function selecionarItemVariacao(variacao: VariacaoSelecionada | null): VariacaoSelecionada["produto_variacao_item"][number] | null {
  if (!variacao?.produto_variacao_item?.length) {
    return null;
  }

  // Uma linha de `produto_variacao` representa a combinação selecionada.
  // Os itens abaixo pertencem a essa combinação (Cor, Tamanho etc.).
  // O preço/SKU da combinação é o mesmo item comercial e não deve ser
  // escolhido arbitrariamente de outra variação.
  return variacao.produto_variacao_item.find((item) => item.ativo !== false) ?? null;
}

function obterAtributo(variacao: VariacaoSelecionada | null | undefined, tipoNome: string) {
  const chave = tipoNome.trim().toLowerCase();

  return (
    variacao?.produto_variacao_item
      ?.find(
        (item) =>
          item.variacao_valor?.variacao_tipo?.nome
            ?.trim()
            .toLowerCase() === chave
      )
      ?.variacao_valor?.valor ?? ""
  );
}

function verificarDisponibilidadeCheckout(
  produto: Produto,
  itemVariacao: VariacaoSelecionada["produto_variacao_item"][number],
  quantidade: number
) {
  const origem = String(produto.origem ?? "").trim().toLowerCase();
  const dropshipping =
    origem === "cj" ||
    Boolean(itemVariacao.fornecedor_sku) ||
    Boolean(produto.id_fornecedor);

  if (itemVariacao.ativo === false) {
    throw new Error(`A variação selecionada de ${produto.nome} está inativa.`);
  }

  if (dropshipping) {
    if (!itemVariacao.fornecedor_sku && !itemVariacao.sku) {
      throw new Error(`A variação de ${produto.nome} não possui identificação do fornecedor.`);
    }

    // For dropshipping, zero local stock is not a blocking condition.
    // Supplier availability is represented by the supplier SKU/VID and
    // can be synchronized separately.
    return;
  }

  const estoque = Number(itemVariacao.estoque ?? 0);
  if (estoque < quantidade) {
    throw new Error(
      `Estoque insuficiente para ${produto.nome}. Disponível: ${estoque}.`
    );
  }
}

export async function criarCheckoutCarrinho(
  userId: string,
  enderecoId: number,
  selectedItemIds?: number[]
) {
  const selectedItemIdsMetadata = JSON.stringify(selectedItemIds ?? []);

  if (selectedItemIdsMetadata.length > 500) {
    throw new Error(
      "A quantidade de itens selecionados excede o limite permitido para este checkout."
    );
  }

  let query = supabase
    .from("carrinho")
    .select(`
      id,
      id_produto,
      id_variacao,
      quantidade,
      produto (
        id,
        nome,
        origem,
        origem_pais_codigo,
        id_fornecedor,
        warehouse_id,
        produto_imagem (
          id,
          caminho,
          principal,
          ordem,
          id_valor
        )
      )
    `)
    .eq("id_user", userId);

  if (Array.isArray(selectedItemIds) && selectedItemIds.length > 0) {
    query = query.in("id", selectedItemIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erro ao buscar carrinho: ${error.message}`);
  }

  const itens = (data as unknown as ItemCarrinho[]) ?? [];

  if (!itens.length) {
    throw new Error("Carrinho vazio");
  }

  const line_items = await Promise.all(
    itens.map(async (item) => {
      const produto = item.produto;
      const variacao = item.id_variacao ? await carregarVariacao(item.id_variacao) : null;

      const itemVariacao = selecionarItemVariacao(variacao);

      if (!itemVariacao) {
        throw new Error(`Nenhuma variação ativa encontrada para ${produto.nome}.`);
      }

      verificarDisponibilidadeCheckout(
        produto,
        itemVariacao,
        Math.max(1, Number(item.quantidade) || 1)
      );

      const precoFinal = Number(itemVariacao.preco);

      const cor = obterAtributo(variacao, "cor");
      const modelo = obterAtributo(variacao, "modelo");
      const voltagem = obterAtributo(variacao, "voltagem");

      const resumo = [cor, modelo, voltagem].filter(Boolean);
      const nomeCheckout = resumo.length ? `${produto.nome} • ${resumo.join(" • ")}` : produto.nome;

      const principal = variantImageService.getPrimaryImage(produto.produto_imagem ?? [], variacao);
      const imageUrl = principal
        ? supabase.storage.from("produtos").getPublicUrl(principal.caminho).data.publicUrl
        : undefined;

      return {
        quantity: Number(item.quantidade),
        price_data: {
          currency: "brl",
          unit_amount: Math.round(precoFinal * 100),
          product_data: {
            name: nomeCheckout,
            metadata: {
              produto_id: String(item.id_produto ?? produto.id ?? ""),
              variacao_id: String(item.id_variacao ?? ""),
              sku: String(itemVariacao.sku ?? ""),
              cor: String(cor ?? ""),
              modelo: String(modelo ?? ""),
              voltagem: String(voltagem ?? ""),
              quantidade: String(Number(item.quantidade) || 1),
              usuario_id: String(userId),
            },
            ...(imageUrl ? { images: [imageUrl] } : {}),
          },
        },
      };
    })
  );

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuario")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (usuarioError || !usuario?.id) {
    throw usuarioError ?? new Error("Usuário não encontrado.");
  }

  const { data: endereco, error: enderecoError } = await supabase
    .from("enderecos")
    .select("cep")
    .eq("id", enderecoId)
    .eq("id_usuario", usuario.id)
    .single();

  if (enderecoError || !endereco?.cep) {
    throw new Error("O endereço selecionado não possui um CEP válido.");
  }

  const usdBrl = await getUsdBrlRate();

  const freightItems = await Promise.all(
    itens.map(async (item) => {
      const variacao = item.id_variacao
        ? await carregarVariacao(item.id_variacao)
        : null;
      const itemVariacao = selecionarItemVariacao(variacao);

      if (!itemVariacao) {
        throw new Error(`Nenhuma variação ativa encontrada para ${item.produto.nome}.`);
      }

      const quantidadeItem = Math.max(1, Number(item.quantidade) || 1);

      verificarDisponibilidadeCheckout(
        item.produto,
        itemVariacao,
        quantidadeItem
      );

      return {
        product: item.produto,
        variantId: variacao?.external_variant_id ?? itemVariacao.fornecedor_sku ?? null,
        variantSku: itemVariacao.sku ?? null,
        destinationCep: String(endereco.cep),
        quantity: quantidadeItem,
        productPrice: Number(itemVariacao.preco) || 0,
        cartItemId: item.id,
        produtoId: item.id_produto ?? item.produto.id ?? null,
      };
    })
  );

  // A CJ/Frenet calcula o frete por remessa. Itens que saem do mesmo
  // warehouse/origem são cotados juntos; somente origens diferentes geram
  // fretes separados.
  const resultadoFrete = await calcularFreteCarrinho(
    freightItems,
    String(endereco.cep),
    usdBrl.rate
  );

  const freteTotal = resultadoFrete.totalBRL;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    metadata: {
      userId,
      enderecoId: String(enderecoId),
      selectedItemIds: selectedItemIdsMetadata,
      frete_total_brl: freteTotal.toFixed(2),
    },
    line_items: [
      ...line_items,
      ...(freteTotal > 0
        ? [{
            price_data: {
              currency: "brl" as const,
              unit_amount: Math.round(freteTotal * 100),
              product_data: {
                name: "Frete",
                description: "Frete de entrega",
              },
            },
            quantity: 1,
          }]
        : []),
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/sucesso`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/cancelado`,
  });

  return session;
}
