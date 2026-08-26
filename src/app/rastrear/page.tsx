"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/supabaseClient";
import { traduzirStatusPedido } from "@/src/lib/status-pedido";

type PedidoRastreio = {
  id: number;
  status?: string | null;
  cj_status?: string | null;
  codigo_rastreio?: string | null;
  transportadora?: string | null;
  cj_tracking_url?: string | null;
  created_at: string;
};

export default function RastrearPage() {
  const [pedidos, setPedidos] = useState<PedidoRastreio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarPedidos() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErro("Entre na sua conta para acompanhar seus pedidos.");
        setCarregando(false);
        return;
      }

      const { data, error } = await supabase
        .from("pedido")
        .select(
          "id, status, cj_status, codigo_rastreio, transportadora, cj_tracking_url, created_at"
        )
        .eq("id_usuario", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErro("Não foi possível carregar seus rastreamentos.");
      } else {
        setPedidos((data ?? []) as PedidoRastreio[]);
      }
      setCarregando(false);
    }

    carregarPedidos();
  }, []);

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-600">
            Entrega
          </p>
          <h1 className="mt-2 text-3xl font-bold">Rastreamento dos pedidos</h1>
          <p className="mt-2 text-slate-600">
            Acompanhe o status e os dados de entrega das suas compras.
          </p>
        </div>

        {carregando && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Carregando rastreamentos...
          </div>
        )}

        {erro && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {erro}
          </div>
        )}

        {!carregando && !erro && pedidos.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            Você ainda não possui pedidos.
          </div>
        )}

        {!carregando && !erro && pedidos.length > 0 && (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <article
                key={pedido.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Pedido #{pedido.id}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {traduzirStatusPedido(pedido.cj_status ?? pedido.status)}
                  </span>
                </div>

                {(pedido.codigo_rastreio || pedido.transportadora || pedido.cj_tracking_url) ? (
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
                    {pedido.codigo_rastreio && (
                      <p>
                        Código de rastreio: <strong>{pedido.codigo_rastreio}</strong>
                      </p>
                    )}
                    {pedido.transportadora && (
                      <p>
                        Transportadora: <strong>{pedido.transportadora}</strong>
                      </p>
                    )}
                    {pedido.cj_tracking_url && (
                      <Link
                        href={pedido.cj_tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex pt-2 font-medium text-indigo-600 hover:underline"
                      >
                        Acompanhar entrega
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
                    O código de rastreio ainda não está disponível.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}