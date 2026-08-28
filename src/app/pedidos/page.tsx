"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/src/components/layout/Admin";
import { supabase } from "@/supabaseClient";
import { variantImageService } from "@/src/services/products/services/VariantImageService";
import { podeCancelarPedido, traduzirStatusPedido } from "@/src/lib/status-pedido";

export default function Pedido() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState<any | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [cancelandoPedido, setCancelandoPedido] = useState(false);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);

      // Busca o usuário autenticado
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Usuário não autenticado", authError);
        setPedidos([]);
        setCarregando(false);
        return;
      }

      // Busca apenas os pedidos do usuário logado
const { data, error } = await supabase
  .from("pedido")
  .select(`
    *,
    pedidoItem (
    quantidade,
    preco_unitario,
    subtotal,
    id_variacao,

    produto (
      id,
      nome,
      produto_imagem (
        id,
        caminho,
        principal,
        ordem,
        id_valor
      )
    ),

    produto_variacao (
      id,
      produto_variacao_item (
        id_valor,

        variacao_valor (
          valor,

          variacao_tipo (
            nome
          )
        )
      )
    )
)
  `)
  .eq("id_usuario", user.id)
  
  .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
        setPedidos([]);
        setCarregando(false);
        return;
      }

const pedidosNormalizados = (data ?? []).map((pedido: any) => ({
  ...pedido,

  pedidoItem: (pedido.pedidoItem ?? []).map((item: any) => {
    const imagens =
      item.produto?.produto_imagem ?? [];
    const principal = variantImageService.getPrimaryImage(
      imagens,
      item.produto_variacao
    );

    const atributos =
  item.produto_variacao?.produto_variacao_item
    ?.map((v: any) => ({
      tipo: v.variacao_valor?.variacao_tipo?.nome,
      valor: v.variacao_valor?.valor,
    }))
    .filter((v: any) => v.valor) ?? [];

    return {
      ...item,

      atributos,

      produto: {
        ...item.produto,

        image: principal
          ? supabase.storage
              .from("produtos")
              .getPublicUrl(principal.caminho)
              .data.publicUrl
          : "",
      },
    };
  }),
}));

      setPedidos(pedidosNormalizados);
      setCarregando(false);
    }

    carregar();
  }, []);

  async function confirmarCancelamento() {
    if (!pedidoParaCancelar || !motivoCancelamento.trim()) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    setCancelandoPedido(true);

    try {
      const response = await fetch(`/api/pedidos/${pedidoParaCancelar.id}/cancelar/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ motivo: motivoCancelamento }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? "Não foi possível cancelar o pedido.");
        return;
      }

      setPedidos((pedidosAtuais) =>
        pedidosAtuais.map((item) =>
          item.id === pedidoParaCancelar.id ? { ...item, ...data } : item
        )
      );
      setPedidoParaCancelar(null);
      setMotivoCancelamento("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Não foi possível cancelar o pedido.");
    } finally {
      setCancelandoPedido(false);
    }
  }

  return (
    <>
      <div className="space-y-6" >
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Meus Pedidos
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Aqui estão todos os pedidos realizados pela sua conta.
          </p>
        </div>

        {carregando ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
            Carregando pedidos...
          </div>
        ) : pedidos.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
            Você ainda não realizou nenhum pedido.
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Pedido #{pedido.id}
                    </h2>

                    <p className="text-sm text-slate-600">
                      Status: {traduzirStatusPedido(pedido.status)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Total: R$ {Number(pedido.valorTotal ?? 0).toFixed(2)}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {new Date(pedido.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>

                {podeCancelarPedido(pedido.status, pedido.cj_status) && (
                  <button
                    type="button"
                    onClick={() => setPedidoParaCancelar(pedido)}
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Cancelar compra
                  </button>
                )}

                <div className="mt-4 space-y-3">
                  <div>
                    <Link
                      href={pedido.cj_tracking_url || "/rastrear"}
                      {...(pedido.cj_tracking_url
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="inline-flex rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      Rastrear pedido
                    </Link>
                  </div>

                  {(pedido.cj_status ||
                    pedido.codigo_rastreio ||
                    pedido.transportadora ||
                    pedido.cj_tracking_url) && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="mb-2 font-semibold text-slate-900">Rastreamento</p>
                      <div className="space-y-1">
                        {pedido.cj_status && (
                          <p>
                            Status: <span className="font-medium">{traduzirStatusPedido(pedido.cj_status)}</span>
                          </p>
                        )}
                        {pedido.codigo_rastreio && (
                          <p>
                            Código de rastreio: <span className="font-medium">{pedido.codigo_rastreio}</span>
                          </p>
                        )}
                        {pedido.transportadora && (
                          <p>
                            Transportadora: <span className="font-medium">{pedido.transportadora}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {(pedido.pedidoItem ?? []).map(
                    (item: any, index: number) => (
                      <div
                        key={`${pedido.id}-${index}`}
                        className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {item.produto?.image ? (
                            <img
                              src={item.produto.image}
                              alt={item.produto.nome}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500">
                              Sem imagem
                            </div>
                          )}

                          <div>
                            <div>
                                <p className="font-medium text-slate-900">
                                  {item.produto?.nome}
                                </p>

                                {item.atributos?.length > 0 && (
                                  <p className="text-xs text-slate-500">
                                    {item.atributos
                                      .map((a: any) => a.valor)
                                      .join(" • ")}
                                  </p>
                                )}

                                <p className="text-sm text-slate-600">
                                  Quantidade: {item.quantidade}
                                </p>
</div>

                            <p className="text-sm text-slate-600">
                              Quantidade: {item.quantidade}
                            </p>
                          </div>
                        </div>

                       <p className="text-sm font-semibold text-slate-900">
                        {Number(item.preco_unitario).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pedidoParaCancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Cancelar compra</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tem certeza que deseja cancelar este pedido?
            </p>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Motivo do cancelamento (obrigatório)
              <textarea
                value={motivoCancelamento}
                onChange={(event) => setMotivoCancelamento(event.target.value)}
                rows={4}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPedidoParaCancelar(null);
                  setMotivoCancelamento("");
                }}
                disabled={cancelandoPedido}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={confirmarCancelamento}
                disabled={cancelandoPedido || !motivoCancelamento.trim()}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelandoPedido ? "Cancelando..." : "Confirmar cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}