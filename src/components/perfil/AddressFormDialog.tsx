"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Form } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Button } from "@/src/components/ui/button"

export interface AddressFormValues {
  id?: number
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  pais: string
  principal: boolean
}

interface AddressFormDialogProps {
  open: boolean
  onOpenChange(open: boolean): void
  onSave(values: AddressFormValues): Promise<void>
  initialValues?: AddressFormValues
}

type FieldErrors = Partial<Record<keyof AddressFormValues, string>>

const EMPTY_VALUES: AddressFormValues = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  pais: "Brasil",
  principal: false,
}

function normalizeCep(value: string) {
  return value.replace(/\D/g, "").slice(0, 8)
}

function formatCep(value: string) {
  const digits = normalizeCep(value)

  if (digits.length <= 5) {
    return digits
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

function buildInitialValues(values?: AddressFormValues): AddressFormValues {
  if (!values) {
    return EMPTY_VALUES
  }

  return {
    ...EMPTY_VALUES,
    ...values,
    cep: formatCep(values.cep ?? ""),
    complemento: values.complemento ?? "",
    pais: values.pais ?? "Brasil",
    principal: values.principal ?? false,
  }
}

function validate(values: AddressFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (normalizeCep(values.cep).length !== 8) {
    errors.cep = "CEP obrigatório"
  }

  if (!values.logradouro.trim()) {
    errors.logradouro = "Rua obrigatória"
  }

  if (!values.numero.trim()) {
    errors.numero = "Número obrigatório"
  }

  if (!values.bairro.trim()) {
    errors.bairro = "Bairro obrigatório"
  }

  if (!values.cidade.trim()) {
    errors.cidade = "Cidade obrigatória"
  }

  if (!values.estado.trim()) {
    errors.estado = "Estado obrigatório"
  }

  return errors
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs font-medium text-red-600">{message}</p>
}

function AddressFormDialogContent({
  open,
  onOpenChange,
  onSave,
  initialValues,
}: AddressFormDialogProps) {
  const [values, setValues] = useState<AddressFormValues>(() => buildInitialValues(initialValues))
  const [errors, setErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)
  const [checkingCep, setCheckingCep] = useState(false)
  const lastCepLookupRef = useRef("")

  const title = initialValues ? "Editar endereço" : "Novo endereço"

  const cepDigits = useMemo(() => normalizeCep(values.cep), [values.cep])

  useEffect(() => {
    if (cepDigits.length !== 8) {
      lastCepLookupRef.current = ""
      setCheckingCep(false)
      return
    }

    if (lastCepLookupRef.current === cepDigits) {
      return
    }

    lastCepLookupRef.current = cepDigits
    const controller = new AbortController()

    async function lookupCep() {
      setCheckingCep(true)

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, {
          signal: controller.signal,
        })

        const data = (await response.json()) as {
          erro?: boolean
          logradouro?: string
          bairro?: string
          localidade?: string
          uf?: string
        }

        if (data.erro || !response.ok) {
          toast.error("CEP não encontrado")
          return
        }

        setValues((current) => ({
          ...current,
          logradouro: data.logradouro ?? current.logradouro,
          bairro: data.bairro ?? current.bairro,
          cidade: data.localidade ?? current.cidade,
          estado: data.uf ?? current.estado,
          pais: current.pais || "Brasil",
        }))
        setErrors((current) => ({
          ...current,
          cep: undefined,
          logradouro: undefined,
          bairro: undefined,
          cidade: undefined,
          estado: undefined,
        }))
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Não foi possível consultar o CEP")
        }
      } finally {
        setCheckingCep(false)
      }
    }

    lookupCep()

    return () => {
      controller.abort()
    }
  }, [cepDigits])

  function updateField<K extends keyof AddressFormValues>(field: K, value: AddressFormValues[K]) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }))
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!saving) {
      onOpenChange(nextOpen)
    }
  }

  function handleClose() {
    handleOpenChange(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedValues: AddressFormValues = {
      ...values,
      cep: formatCep(values.cep),
      numero: values.numero.trim(),
      complemento: values.complemento?.trim() ?? "",
      bairro: values.bairro.trim(),
      cidade: values.cidade.trim(),
      estado: values.estado.trim().toUpperCase(),
      pais: values.pais.trim() || "Brasil",
    }

    const validationErrors = validate(normalizedValues)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Preencha os campos obrigatórios")
      return
    }

    setSaving(true)

    try {
      await onSave(normalizedValues)
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[92vh] w-[min(96vw,56rem)] overflow-hidden rounded-3xl border-slate-200 bg-[#F8F8FC] p-0"
        showCloseButton
      >
        <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Preencha os dados do endereço para cadastro ou edição.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form onSubmit={handleSubmit} className="max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6 sm:px-8">
          <fieldset disabled={saving} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address-cep">CEP *</Label>
                <div className="relative">
                  <Input
                    id="address-cep"
                    value={values.cep}
                    onChange={(event) => updateField("cep", formatCep(event.target.value))}
                    placeholder="00000-000"
                    className="h-12 rounded-2xl border-slate-200 bg-white pr-11 focus-visible:border-violet-500 focus-visible:ring-violet-500"
                  />
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {checkingCep ? (
                      <Loader2 className="size-4 animate-spin text-violet-600" />
                    ) : (
                      <Check className="size-4 opacity-0" />
                    )}
                  </div>
                </div>
                <FieldError message={errors.cep} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-pais">País</Label>
                <Input
                  id="address-pais"
                  value={values.pais}
                  onChange={(event) => updateField("pais", event.target.value)}
                  className="h-12 rounded-2xl border-slate-200 bg-white focus-visible:border-violet-500 focus-visible:ring-violet-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address-logradouro">Rua *</Label>
                <Input
                  id="address-logradouro"
                  value={values.logradouro}
                  onChange={(event) => updateField("logradouro", event.target.value)}
                  placeholder="Rua, avenida, travessa..."
                  className="h-12 rounded-2xl border-slate-200 bg-white focus-visible:border-violet-500 focus-visible:ring-violet-500"
                />
                <FieldError message={errors.logradouro} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-numero">Número *</Label>
                <Input
                  id="address-numero"
                  value={values.numero}
                  onChange={(event) => updateField("numero", event.target.value)}
                  placeholder="123"
                  className="h-12 rounded-2xl border-slate-200 bg-white focus-visible:border-violet-500 focus-visible:ring-violet-500"
                />
                <FieldError message={errors.numero} />
              </div>

              <div className="flex items-end rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <Checkbox
                    checked={values.principal}
                    onChange={(event) => updateField("principal", event.target.checked)}
                  />
                  Definir como endereço principal
                </label>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address-complemento">Complemento</Label>
                <Input
                  id="address-complemento"
                  value={values.complemento ?? ""}
                  onChange={(event) => updateField("complemento", event.target.value)}
                  placeholder="Apartamento, bloco, referência..."
                  className="h-12 rounded-2xl border-slate-200 bg-white focus-visible:border-violet-500 focus-visible:ring-violet-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-bairro">Bairro *</Label>
                <Input
                  id="address-bairro"
                  value={values.bairro}
                  onChange={(event) => updateField("bairro", event.target.value)}
                  placeholder="Seu bairro"
                  className="h-12 rounded-2xl border-slate-200 bg-white focus-visible:border-violet-500 focus-visible:ring-violet-500"
                />
                <FieldError message={errors.bairro} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-cidade">Cidade *</Label>
                <Input
                  id="address-cidade"
                  value={values.cidade}
                  onChange={(event) => updateField("cidade", event.target.value)}
                  placeholder="Cidade"
                  className="h-12 rounded-2xl border-slate-200 bg-white focus-visible:border-violet-500 focus-visible:ring-violet-500"
                />
                <FieldError message={errors.cidade} />
              </div>

              <div className="space-y-2 md:max-w-40">
                <Label htmlFor="address-estado">Estado *</Label>
                <Input
                  id="address-estado"
                  value={values.estado}
                  onChange={(event) => updateField("estado", event.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                  className="h-12 rounded-2xl border-slate-200 bg-white uppercase focus-visible:border-violet-500 focus-visible:ring-violet-500"
                />
                <FieldError message={errors.estado} />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="rounded-2xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                disabled={saving}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="rounded-2xl bg-linear-to-r from-[#6D28D9] to-[#8B5CF6] text-white hover:shadow-lg"
                disabled={saving}
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  "Salvar endereço"
                )}
              </Button>
            </div>
          </fieldset>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default function AddressFormDialog(props: AddressFormDialogProps) {
  const dialogKey = `${props.open ? "open" : "closed"}-${props.initialValues?.id ?? "new"}`

  return <AddressFormDialogContent key={dialogKey} {...props} />
}