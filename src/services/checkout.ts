import Stripe from "stripe";
import { supabase } from "../../supabaseClient";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY não configurada");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
});

type ProdutoImagem = {
  caminho: string;
  principal: boolean;
  ordem: number;
};

type Produto = {
  nome: string;
  preco: string | number;
  produto_imagem?: ProdutoImagem[];
};

type ItemCarrinho = {
  quantidade: number | string;
  produto: Produto;
};

export async function criarCheckoutCarrinho(
  userId: string
) {
  const { data, error } = await supabase
    .from("carrinho")
    .select(`
      quantidade,
      produto (
        nome,
        preco,
        produto_imagem (
          caminho,
          principal,
          ordem
        )
      )
    `)
    .eq("id_user", userId);

  if (error) {
    console.error(error);
    throw new Error("Erro ao buscar carrinho");
  }

  const itens = data as unknown as ItemCarrinho[];

  if (!itens?.length) {
    throw new Error("Carrinho vazio");
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
    itens.map((item) => {
      const produto = item.produto;

      // Procura a imagem principal
      const principal =
        produto.produto_imagem?.find(
          (img) => img.principal
        ) ??
        produto.produto_imagem?.[0];

      // Gera URL pública
      const imageUrl = principal
        ? supabase.storage
            .from("produtos")
            .getPublicUrl(principal.caminho)
            .data.publicUrl
        : undefined;

      return {
        quantity: Number(item.quantidade),

        price_data: {
          currency: "brl",

          unit_amount: Math.round(
            Number(produto.preco) * 100
          ),

          product_data: {
            name: produto.nome,

            ...(imageUrl
              ? {
                  images: [imageUrl],
                }
              : {}),
          },
        },
      };
    });

  const session =
    await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      mode: "payment",

      metadata: {
        userId,
      },

      line_items,

      success_url: `${
        process.env.NEXT_PUBLIC_APP_URL ??
        "http://localhost:3000"
      }/sucesso`,

      cancel_url: `${
        process.env.NEXT_PUBLIC_APP_URL ??
        "http://localhost:3000"
      }/cancelado`,
    });

  return session;
}