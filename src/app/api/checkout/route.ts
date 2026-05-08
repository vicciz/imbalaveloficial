import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { buscarProduto } from '@/src/services/produtos';
import { supabase } from '@/supabaseClient';

function getPublicImageUrl(image?: string | null) {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  if (!supabase) return null;

  const { data } = supabase.storage.from('produtos').getPublicUrl(image);
  return data?.publicUrl ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'ID do produto inválido' }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {});
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    const { data: produto, error } = await buscarProduto(id);

    if (error || !produto) {
      throw new Error('Produto não encontrado');
    }

    const preco = Number(produto.preco);
    if (Number.isNaN(preco) || preco <= 0) {
      throw new Error('Preço do produto inválido');
    }

    const imageUrl = getPublicImageUrl(
      produto.image || produto.image1 || produto.image2 || produto.image3 || produto.image4 || produto.image5 || produto.image6 || produto.imagem_detalhe
    );

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
              images: imageUrl ? [imageUrl] : undefined,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/sucesso`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/cancelado`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}