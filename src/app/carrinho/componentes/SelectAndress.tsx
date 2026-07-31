"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import { cn } from "@/src/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import {
  listarEnderecos,
  Endereco,
} from "@/src/services/usuario/enderecos";

import { supabase } from "@/supabaseClient";

type SelectAddressProps = {
  value?: number | null;
  onChange: (id: number) => void;
  className?: string;
};

export function SelectAddress({
  value,
  onChange,
  className,
}: SelectAddressProps) {
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarEnderecos() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await listarEnderecos(user.id);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setEnderecos(data);

      if (!value && data.length > 0) {
        const principal =
          data.find((item) => item.principal) ??
          data[0];

        onChange(principal.id);
      }

      setLoading(false);
    }

    carregarEnderecos();
  }, [value, onChange]);

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-violet-600" />
          Endereço de entrega
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando endereços...
          </div>
        ) : enderecos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            Nenhum endereço cadastrado.
          </div>
        ) : (
          <Select
            value={value?.toString()}
            onValueChange={(v) => onChange(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um endereço" />
            </SelectTrigger>

            <SelectContent>
              {enderecos.map((endereco) => (
                <SelectItem
                  key={endereco.id}
                  value={String(endereco.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {endereco.principal && "🏠 "}
                      {endereco.logradouro}, {endereco.numero}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {endereco.bairro} • {endereco.cidade}/{endereco.estado}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}