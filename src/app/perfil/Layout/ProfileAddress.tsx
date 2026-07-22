"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/supabaseClient";
import AddressFormDialog, { type AddressFormValues } from "@/src/components/perfil/AddressFormDialog";
import { criarEndereco, editarEndereco } from "@/src/services/usuario/enderecos";

interface Endereco {
  id: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  principal: boolean;
  id_usuario?: number;
}

export default function ProfileAddress() {
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressFormValues | undefined>(undefined);

  const carregarEnderecos = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: usuario, error: usuarioError } = await supabase
      .from("usuario")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (usuarioError || !usuario) {
      console.error(usuarioError);
      setLoading(false);
      return;
    }

    setUsuarioId(usuario.id);

    const { data: enderecos, error } = await supabase
      .from("enderecos")
      .select("*")
      .eq("id_usuario", usuario.id);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setEnderecos((enderecos ?? []) as Endereco[]);

    const principal = enderecos?.find((endereco) => endereco.principal);

    if (principal) {
      setSelecionado(principal.id);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void carregarEnderecos();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [carregarEnderecos]);

  async function selecionarEndereco(id: number) {
    setSelecionado(id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: usuario } = await supabase
      .from("usuario")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!usuario) return;

    await supabase
      .from("enderecos")
      .update({ principal: false })
      .eq("id_usuario", usuario.id);

    await supabase
      .from("enderecos")
      .update({ principal: true })
      .eq("id", id);

    void carregarEnderecos();
  }

  async function handleSaveAddress(values: AddressFormValues) {
    if (!usuarioId) {
      return;
    }

    const payload = {
      cep: values.cep.replace(/\D/g, ""),
      logradouro: values.logradouro,
      numero: values.numero,
      complemento: values.complemento ?? null,
      bairro: values.bairro,
      cidade: values.cidade,
      estado: values.estado,
      pais: values.pais,
      id_usuario: usuarioId,
      principal: values.principal,
    };

    if (values.principal) {
      await supabase
        .from("enderecos")
        .update({ principal: false })
        .eq("id_usuario", usuarioId);
    }

    if (values.id) {
      await editarEndereco(values.id, payload);
    } else {
      await criarEndereco(payload);
    }

    setDialogOpen(false);
    setEditingAddress(undefined);
    void carregarEnderecos();
  }

  return (
    <div className="space-y-6 pt-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Endereços</h1>

          <p className="mt-2 text-slate-500">
            Escolha qual endereço será utilizado em seus pedidos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAddress(undefined);
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-white transition hover:bg-violet-700"
        >
          <Plus size={18} />
          Novo endereço
        </button>
      </div>

      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveAddress}
        initialValues={editingAddress}
      />

      {loading && (
        <div className="rounded-xl border p-8">Carregando endereços...</div>
      )}

      {!loading && enderecos.length === 0 && (
        <div className="rounded-xl border p-8 text-center">
          <h2 className="text-xl font-semibold">Nenhum endereço cadastrado</h2>

          <p className="mt-2 text-slate-500">Adicione seu primeiro endereço.</p>
        </div>
      )}

      {!loading && enderecos.length > 0 && (
        <div className="space-y-4">
          {enderecos.map((endereco) => (
            <div
              key={endereco.id}
              onClick={() => selecionarEndereco(endereco.id)}
              className={`group cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 ${
                selecionado === endereco.id
                  ? "border-violet-600 bg-violet-50 shadow-lg"
                  : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    checked={selecionado === endereco.id}
                    onChange={() => selecionarEndereco(endereco.id)}
                    className="mt-1 h-5 w-5 accent-violet-600"
                  />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-violet-600" />

                      <span className="font-semibold text-slate-900">
                        {endereco.principal ? "Endereço Principal" : "Endereço"}
                      </span>

                      {endereco.principal && (
                        <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">
                          Principal
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-slate-600">
                      <p>
                        {endereco.logradouro}, {endereco.numero}
                      </p>

                      {endereco.complemento && <p>{endereco.complemento}</p>}

                      <p>{endereco.bairro}</p>

                      <p>
                        {endereco.cidade} - {endereco.estado}
                      </p>

                      <p>
                        CEP: {endereco.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")}
                      </p>

                      <p>{endereco.pais}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-50"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingAddress({
                        id: endereco.id,
                        cep: endereco.cep,
                        logradouro: endereco.logradouro,
                        numero: endereco.numero,
                        complemento: endereco.complemento ?? "",
                        bairro: endereco.bairro,
                        cidade: endereco.cidade,
                        estado: endereco.estado,
                        pais: endereco.pais,
                        principal: endereco.principal,
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-1 inline h-4 w-4" />
                    Editar
                  </button>

                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <Trash2 className="mr-1 inline h-4 w-4" />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}