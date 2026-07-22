import { BadgeCheck, ShieldCheck } from "lucide-react"

import { Card, CardContent } from "@/src/components/ui/card"

interface ProfileHeaderProps {
  roleText: string
}

export default function ProfileHeader({ roleText }: ProfileHeaderProps) {
  return (
    <Card className="overflow-hidden rounded-[28px] border-slate-200 bg-white shadow-sm">
      <CardContent className="relative px-6 py-6 sm:px-8 sm:py-8">
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] opacity-95" />

        <div className="relative space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold tracking-[0.18em] text-violet-700 uppercase">
                Minha Conta
              </p>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Perfil do Usuário
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  Gerencie suas informações pessoais, endereço principal e preferências com uma experiência premium inspirada em grandes marketplaces.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm">
                <BadgeCheck className="size-4" />
                {roleText}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
                <ShieldCheck className="size-4" />
                Conta protegida
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-slate-200 bg-[#FBFBFE] p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Atendimento
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Suporte prioritário Imbalável
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Gestão da conta
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Dados, segurança e preferências
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Experiência
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                Layout premium e navegação organizada
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}