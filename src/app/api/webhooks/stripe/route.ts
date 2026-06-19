import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: "2026-04-22.dahlia",
  }
);

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature =
    req.headers.get("stripe-signature");

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data.object as Stripe.Checkout.Session;

        const userId =
          session.metadata?.userId;

        console.log(
          "Pagamento aprovado do usuário:",
          userId
        );

        // TODO:
        // criar pedido
        // criar pedidoItem
        // atualizar estoque
        // limpar carrinho

        break;
      }

      case "payment_intent.payment_failed": {
        console.log("Pagamento recusado");
        break;
      }

      case "payment_intent.succeeded": {
        console.log("Pagamento processado");
        break;
      }

      case "charge.succeeded": {
        console.log("Cobrança concluída");
        break;
      }

      default: {
        console.log(
          "Evento recebido:",
          event.type
        );
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (err) {
    console.error(
      "ERRO WEBHOOK:",
      err
    );

    return NextResponse.json(
      {
        error: "Webhook inválido",
      },
      {
        status: 400,
      }
    );
  }
}