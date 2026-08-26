import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();

function obterStripe() {
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY não configurada.");
  }

  return new Stripe(stripeSecretKey);
}

export async function estornarPagamentoPedido(pedido: {
  id: number;
  status?: string | null;
  stripe_session_id?: string | null;
  stripe_refund_id?: string | null;
}) {
  const status = String(pedido.status ?? "").trim().toUpperCase();
  if (status !== "CANCELLED") {
    throw new Error("O pedido precisa estar CANCELLED para gerar o refund.");
  }

  if (pedido.stripe_refund_id?.trim()) {
    return {
      refundId: pedido.stripe_refund_id.trim(),
      status: "already_refunded",
      amount: 0,
    };
  }

  const sessionId = pedido.stripe_session_id?.trim();
  if (!sessionId) {
    throw new Error("O pedido não possui stripe_session_id.");
  }

  const stripe = obterStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIntent = session.payment_intent;
  const paymentIntentId =
    typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id;

  if (!paymentIntentId) {
    throw new Error("A sessão Stripe não possui payment_intent.");
  }

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
  }, {
    idempotencyKey: `pedido-${pedido.id}-refund`,
  });

  return {
    refundId: refund.id,
    status: refund.status,
    amount: refund.amount,
  };
}
