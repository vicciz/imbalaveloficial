"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Mail, PackageCheck, Truck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type OrderStatus =
  | "checking"
  | "created"
  | "processing"
  | "not_paid"
  | "unavailable";

type OrderStatusResponse = {
  status: "created" | "processing" | "not_paid";
  orderId?: number;
};

export default function SucessoPage() {
  const [status, setStatus] = useState<OrderStatus>("checking");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [pollingComplete, setPollingComplete] = useState(false);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");

    if (!sessionId) {
      setStatus("unavailable");
      return;
    }

    let active = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    async function verificarPedido() {
      let aguardandoPedido = false;

      try {
        const response = await fetch(
          `/api/stripe/session-status?session_id=${encodeURIComponent(sessionId!)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Não foi possível consultar o pedido.");
        }

        const result = (await response.json()) as OrderStatusResponse;
        if (!active) return;

        if (result.status === "created") {
          setOrderId(result.orderId ?? null);
          setStatus("created");
          return;
        }

        if (result.status === "not_paid") {
          setStatus("not_paid");
          return;
        }

        setStatus("processing");
        aguardandoPedido = true;
      } catch {
        if (!active) return;
        setStatus("unavailable");
      }

      attempts += 1;
      if (active && attempts < 15) {
        timer = setTimeout(verificarPedido, 2_000);
      } else if (active && aguardandoPedido) {
        setPollingComplete(true);
      }
    }

    void verificarPedido();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const pedidoCriado = status === "created";
  const aguardandoConfirmacao = status === "checking" || status === "processing";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-emerald-50 px-4 py-12">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-violet-950/5 sm:p-10"
      >
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div
            className={`mb-5 flex size-20 items-center justify-center rounded-full ${
              pedidoCriado
                ? "bg-emerald-100 text-emerald-700"
                : aguardandoConfirmacao
                  ? "bg-violet-100 text-violet-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {pedidoCriado ? (
              <CheckCircle2 aria-hidden="true" className="size-11" />
            ) : aguardandoConfirmacao ? (
              <Clock3 aria-hidden="true" className="size-10 animate-pulse" />
            ) : (
              <PackageCheck aria-hidden="true" className="size-10" />
            )}
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">
            Imbalável
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {pedidoCriado
              ? "Pedido criado com sucesso!"
              : aguardandoConfirmacao
                ? "Confirmando seu pedido"
                : status === "not_paid"
                  ? "Pagamento não confirmado"
                  : "Não foi possível confirmar o pedido"}
          </h1>

          {pedidoCriado ? (
            <>
              <p className="mt-3 text-slate-600">
                {orderId
                  ? <>Seu pedido <span className="font-semibold text-slate-900">#{orderId}</span> foi criado e o pagamento foi aprovado.</>
                  : "Seu pedido foi criado e o pagamento foi aprovado."}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Os detalhes e a confirmação serão enviados para o e-mail cadastrado.
              </p>
            </>
          ) : aguardandoConfirmacao ? (
            <p className="mt-3 max-w-lg text-slate-600">
              {pollingComplete
                ? "O pagamento foi recebido, mas o registro do pedido ainda não foi confirmado. Consulte seus pedidos antes de tentar pagar novamente ou entre em contato com o atendimento."
                : "O pagamento foi recebido. Estamos aguardando a confirmação do sistema para concluir o registro do pedido. Esta página será atualizada automaticamente."}
            </p>
          ) : status === "not_paid" ? (
            <p className="mt-3 max-w-lg text-slate-600">
              Não identificamos um pagamento aprovado, então nenhum pedido foi
              criado e não foi enviado e-mail de confirmação. Você pode voltar
              à loja e tentar novamente.
            </p>
          ) : (
            <p className="mt-3 max-w-lg text-slate-600">
              Não conseguimos verificar agora se o pedido foi criado. Consulte
              seus pedidos ou entre em contato com o atendimento antes de tentar
              pagar novamente.
            </p>
          )}

          {pedidoCriado && (
            <div className="mt-8 grid w-full gap-3 text-left sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Mail aria-hidden="true" className="size-5 text-violet-700" />
                  Confirmação por e-mail
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Enviaremos o resumo da compra para o e-mail cadastrado.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Truck aria-hidden="true" className="size-5 text-violet-700" />
                  Entrega e rastreamento
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  O prazo estimado é de 15 a 45 dias. O link de rastreio ficará
                  disponível após o despacho do pedido.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row">
            {pedidoCriado && (
              <Link
                href="/pedidos"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-700 px-6 py-3 font-semibold text-white transition hover:bg-violet-800"
              >
                Acompanhar pedido
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Voltar à loja
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
