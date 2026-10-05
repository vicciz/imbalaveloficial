"use client";

import Link from "next/link";
import { CircleX, Mail, ShoppingCart, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function CanceladoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-violet-50 px-4 py-12">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-violet-950/5 sm:p-10"
      >
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <CircleX aria-hidden="true" className="size-11" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">
            Imbalável
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Compra não finalizada
          </h1>
          <p className="mt-3 max-w-lg text-slate-600">
            O pagamento foi cancelado ou não foi concluído. Por isso, seu pedido
            não foi criado e você não receberá um e-mail de confirmação desta
            tentativa.
          </p>

          <div className="mt-8 grid w-full gap-3 text-left sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Mail aria-hidden="true" className="size-5 text-violet-700" />
                E-mail de confirmação
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A confirmação será enviada somente quando uma compra for
                concluída e o pedido criado.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Truck aria-hidden="true" className="size-5 text-violet-700" />
                Entrega e rastreamento
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Em uma compra concluída, o prazo estimado é de 15 a 45 dias. O
                link de rastreio fica disponível após o despacho.
              </p>
            </div>
          </div>

          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/carrinho"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3 font-semibold text-white transition hover:bg-violet-800"
            >
              <ShoppingCart aria-hidden="true" className="size-5" />
              Voltar ao carrinho
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
