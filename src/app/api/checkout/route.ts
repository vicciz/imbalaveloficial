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

    // Log para debug em produção
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
    console.log('STRIPE_SECRET_KEY presente:', !!process.env.STRIPE_SECRET_KEY);
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY não configurada no ambiente. Verifique se a variável existe em Production no Vercel.');
      return NextResponse.json({
        error: 'Configuração de pagamento não encontrada',
        details: 'STRIPE_SECRET_KEY não configurada'
      }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2026-04-22.dahlia",
    });

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.imbalavel.com.br'}/sucesso`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.imbalavel.com.br'}/cancelado`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}