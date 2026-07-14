"use client";

import Image from "next/image";

import { Separator } from "@/src/components/ui/separator";

import {
  ShieldCheck,
  CreditCard,
  Lock,
} from "lucide-react";

import { IMAGES } from "@/src/constants/imagens";

export default function ProductPayments() {
  return (
    <div className="mt-8 space-y-6">

      <Separator />

      {/* Pix */}

      <div className="rounded-xl border border-green-200 bg-green-50 p-4">

        <div className="flex items-center gap-4">

          <Image
            src={IMAGES.pagamentos.pix}
            alt="Pix"
            width={80}
            height={80}
          />

          <div>

            <h3 className="font-semibold text-green-700">
              5% OFF no Pix
            </h3>

            <p className="text-sm text-green-600">
              Pagamento aprovado na hora.
            </p>

          </div>

        </div>

      </div>

      {/* Bandeiras */}

      <div>

        <p className="mb-4 text-base font-semibold">
          Formas de pagamento
        </p>

        <div className="grid grid-cols-2 gap-3">

          <div className="
flex
h-16
items-center
justify-center
rounded-xl
border
bg-white
shadow-sm
transition-all
hover:-translate-y-1
hover:border-violet-500
hover:shadow-md
">
            <Image
              src={IMAGES.pagamentos.pix}
              alt="Pix"
              width={60}
height={24}
            />
          </div>

          <div className="
flex
h-16
items-center
justify-center
rounded-xl
border
bg-white
shadow-sm
transition-all
hover:-translate-y-1
hover:border-violet-500
hover:shadow-md
">
            <Image
              src={IMAGES.pagamentos.visa}
              alt="Visa"
              width={60}
height={24}
            />
          </div>

          <div className="
flex
h-16
items-center
justify-center
rounded-xl
border
bg-white
shadow-sm
transition-all
hover:-translate-y-1
hover:border-violet-500
hover:shadow-md
">
            <Image
              src={IMAGES.pagamentos.mastercard}
              alt="Mastercard"
              width={60}
height={24}
            />
          </div>

          <div className="
flex
h-16
items-center
justify-center
rounded-xl
border
bg-white
shadow-sm
transition-all
hover:-translate-y-1
hover:border-violet-500
hover:shadow-md
">
            <Image
              src={IMAGES.pagamentos.elo}
              alt="Elo"
              width={60}
height={24}
            />
          </div>

        </div>

      </div>

      {/* Benefícios */}

      <div className="rounded-xl bg-slate-50 p-5 space-y-4">

        <div className="flex items-center gap-3">

          <ShieldCheck className="h-6 w-6 text-green-600" />

          <div>

            <p className="font-medium">
              Compra Segura
            </p>

            <p className="text-xs text-slate-500">
              Seus dados protegidos.
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <CreditCard className="h-6 w-6 text-violet-600" />

          <div>

            <p className="font-medium">
              Até 12x sem juros
            </p>

            <p className="text-xs text-slate-500">
              Nos cartões de crédito.
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <Lock className="h-6 w-6 text-blue-600" />

          <div>

            <p className="font-medium">
              Ambiente Seguro
            </p>

            <p className="text-xs text-slate-500">
              Criptografia ponta a ponta.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}