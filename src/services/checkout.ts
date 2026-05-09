import Stripe from 'stripe';
import { buscarProduto } from './produtos';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não configurada');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export async function criarCheckoutSession(id: number) {

  const { data: produto, error } = await buscarProduto(id);

  if (error || !produto) {
    throw new Error('Produto não encontrado');
  }

  const preco = Number(produto.preco);
  if (Number.isNaN(preco) || preco <= 0) {
    throw new Error('Preço do produto inválido');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          unit_amount: Math.round(preco * 100),
          product_data: {
            name: produto.nome || 'Produto Imbalável',
            description: produto.descricao ?? undefined,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/sucesso`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/cancelado`,
  });

  return session;
}
