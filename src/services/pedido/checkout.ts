import Stripe from "stripe";
import { supabase } from "../../../supabaseClient";
import { variantImageService } from "@/src/services/products/services/VariantImageService";

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
  produto_imagem?: ProdutoImagem[];
};

type VariacaoSelecionada = {
  id: number;
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
      produto_variacao_item (
        id,
        sku,
        preco,
        estoque,
        ativo,
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

export async function criarCheckoutCarrinho(
  userId: string,
  enderecoId: number,
  selectedItemIds?: number[]
) {
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
        preco,
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
    console.error(error);
    throw new Error("Erro ao buscar carrinho");
  }

  const itens = (data as unknown as ItemCarrinho[]) ?? [];

  if (!itens.length) {
    throw new Error("Carrinho vazio");
  }

  const line_items = await Promise.all(
    itens.map(async (item) => {
      const produto = item.produto;
      const variacao = item.id_variacao ? await carregarVariacao(item.id_variacao) : null;

      const itemVariacao = variacao?.produto_variacao_item.find((variationItem) => variationItem.ativo);

      if (!itemVariacao) {
        throw new Error(`Nenhuma variação ativa encontrada para ${produto.nome}.`);
      }

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

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    metadata: {
      userId,
      enderecoId: String(enderecoId),
    },
    line_items,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/sucesso`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/cancelado`,
  });

  return session;
}
