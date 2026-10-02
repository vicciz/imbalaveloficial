import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY não configurada.");
  }

  resendClient ??= new Resend(apiKey);
  return resendClient;
}

export type EnviarEmailPedidoParams = {
  to: string;
  subject: string;
  html: string;
  idempotencyKey?: string;
};

export async function enviarEmail({
  to,
  subject,
  html,
  idempotencyKey,
}: EnviarEmailPedidoParams) {
  const from = process.env.EMAIL_FROM?.trim();

  if (!from) {
    throw new Error("EMAIL_FROM não configurado.");
  }

  const email = getResendClient().emails;
  const payload = {
    from,
    to,
    subject,
    html,
  };
  const { error } = idempotencyKey
    ? await email.send(payload, { idempotencyKey })
    : await email.send(payload);

  if (error) {
    throw new Error(error.message || "Não foi possível enviar o e-mail.");
  }
}
