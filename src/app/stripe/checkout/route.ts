import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { buscarProduto } from '@/src/services/produto/produtos';
import { supabase } from '@/supabaseClient';

type VariacaoSelecionada = {
  id?: number | string;
  sku?: string;
  preco?: number | string;
  produto_variacao_item?: Array<{
    id_valor?: number | null;
    variacao_valor?: {
      valor?: string;
      variacao_tipo?: {
        nome?: string;
      };
    };
  }>;
};

function getPublicImageUrl(image?: string | null) {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  if (!supabase) return null;

  const { data } = supabase.storage.from('produtos').getPublicUrl(image);
  return data?.publicUrl ?? null;
}

function extrairAtributosVariacao(
  variacaoSelecionada?: VariacaoSelecionada | null
) {
  const itens = variacaoSelecionada?.produto_variacao_item ?? [];

  return itens
    .map((item) => {
      const tipo = item.variacao_valor?.variacao_tipo?.nome?.trim();
      const valor = item.variacao_valor?.valor?.trim();

      if (!tipo || !valor) return null;

      return { tipo, valor };
    })
    .filter(Boolean) as Array<{ tipo: string; valor: string }>;
}

function obterAtributo(
  atributos: Array<{ tipo: string; valor: string }>,
  nome: string
) {
  const chave = nome.trim().toLowerCase();

  return (
    atributos.find(
      (atributo) =>
        atributo.tipo.trim().toLowerCase() === chave
    )?.valor ?? ''
  );
}

function obterIdCorSelecionada(
  variacaoSelecionada?: VariacaoSelecionada | null
) {
  const itemCor =
    variacaoSelecionada?.produto_variacao_item?.find(
      (item) =>
        item.variacao_valor?.variacao_tipo?.nome
          ?.trim()
          .toLowerCase() === 'cor'
    );

  return itemCor?.id_valor ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const {
      id,
      quantidade,
      variacaoSelecionada,
      userId,
    } = await request.json();

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

    const quantidadeSelecionada = Math.max(
      1,
      Math.floor(Number(quantidade) || 1)
    );

    const preco = Number(
      variacaoSelecionada?.preco ?? produto.preco
    );
    if (Number.isNaN(preco) || preco <= 0) {
      throw new Error('Preço do produto inválido');
    }

    const atributos = extrairAtributosVariacao(
      variacaoSelecionada as VariacaoSelecionada | null
    );

    const cor = obterAtributo(atributos, 'cor');
    const modelo = obterAtributo(atributos, 'modelo');
    const voltagem = obterAtributo(atributos, 'voltagem');

    const resumoVariacao = [
      cor,
      modelo,
      voltagem,
    ].filter(Boolean);

    const descricaoVariacao = resumoVariacao.length
      ? `${produto.nome} • ${resumoVariacao.join(' • ')}`
      : produto.nome;

    const idCorSelecionada = obterIdCorSelecionada(
      variacaoSelecionada as VariacaoSelecionada | null
    );

    let imageUrl: string | null = null;

    if (idCorSelecionada && Array.isArray(produto.produto_imagem)) {
      const imagensDaCor = produto.produto_imagem
        .filter((img: any) => img.id_valor === idCorSelecionada)
        .sort((a: any, b: any) => a.ordem - b.ordem);

      const imagemVariacao =
        imagensDaCor.find((img: any) => img.principal) ??
        imagensDaCor[0];

      if (imagemVariacao?.caminho) {
        imageUrl = getPublicImageUrl(imagemVariacao.caminho);
      }
    }

    if (!imageUrl) {
      imageUrl = getPublicImageUrl(
        produto.image || produto.image1 || produto.image2 || produto.image3 || produto.image4 || produto.image5 || produto.image6 || produto.imagem_detalhe
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      metadata: {
        produto_id: String(id ?? ''),
        variacao_id: String(variacaoSelecionada?.id ?? ''),
        sku: String(variacaoSelecionada?.sku ?? ''),
        quantidade: String(quantidadeSelecionada),
        cor: String(cor ?? ''),
        modelo: String(modelo ?? ''),
        voltagem: String(voltagem ?? ''),
        usuario_id: String(userId ?? ''),
      },
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: Math.round(preco * 100),
            product_data: {
              name: produto.nome || 'Produto Imbalável',
              description: descricaoVariacao,
              images: imageUrl ? [imageUrl] : undefined,
            },
          },
          quantity: quantidadeSelecionada,
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