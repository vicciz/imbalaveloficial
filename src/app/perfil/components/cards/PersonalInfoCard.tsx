"use client"

import { UserRound } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

interface PersonalInfoCardProps {
  nome: string
  email: string
  telefone?: string
  onSave: (values: { nome: string; telefone: string }) => Promise<void>
  loading?: boolean
}

export default function PersonalInfoCard({
  nome,
  email,
  telefone,
  onSave,
  loading = false,
}: PersonalInfoCardProps) {
  const nomeParts = useMemo(() => nome.trim().split(/\s+/), [nome])
  const [firstName, setFirstName] = useState(nomeParts[0] ?? "")
  const [lastName, setLastName] = useState(nomeParts.slice(1).join(" "))
  const [phone, setPhone] = useState(telefone ?? "")

  const fullName = useMemo(() => {
    return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ")
  }, [firstName, lastName])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSave({
      nome: fullName,
      telefone: phone.trim(),
    })
  }

  function handleReset() {
    setFirstName(nomeParts[0] ?? "")
    setLastName(nomeParts.slice(1).join(" "))
    setPhone(telefone ?? "")
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="space-y-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-[#6D28D9]">
            <UserRound className="size-5" />
          </span>

          <div>
            <CardTitle className="text-xl text-slate-900">
              Informações pessoais
            </CardTitle>
            <CardDescription className="text-slate-500">
              Atualize seus dados pessoais.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="perfil-nome">Nome</Label>
            <Input
              id="perfil-nome"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="h-12 rounded-2xl border-slate-200 bg-white focus-visible:border-violet-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="perfil-telefone">Telefone</Label>
            <Input
              id="perfil-telefone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(00) 00000-0000"
              className="h-12 rounded-2xl border-slate-200 bg-white focus-visible:border-violet-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white text-slate-600"
            onClick={handleReset}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            className="rounded-2xl bg-linear-to-r from-[#6D28D9] to-[#8B5CF6] text-white hover:shadow-lg"
            disabled={loading || !fullName.trim()}
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
        </form>
      </CardContent>
    </Card>
  )
}