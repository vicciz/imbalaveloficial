"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/src/components/layout/Admin";
import { supabase } from "@/supabaseClient";
import { podeCancelarPedido, traduzirStatusPedido } from "@/src/lib/status-pedido";


export default function Pedido() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviandoId, setEnviandoId] = useState<number | null>(null);
  const [documentos, setDocumentos] = useState<Record<number, string>>({});
  const [diagnosticoCJ, setDiagnosticoCJ] = useState<string | null>(null);
  const [consultandoStatusCJ, setConsultandoStatusCJ] = useState(false);
  const [sincronizandoCJ, setSincronizandoCJ] = useState(false);
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState<any | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [cancelandoPedido, setCancelandoPedido] = useState(false);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);

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
              caminho,
              principal,
              ordem
            )
          )
        )
      `)
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
          const imagens = item.produto?.produto_imagem?.sort((a: any, b: any) => a.ordem - b.ordem) ?? [];
          const principal = imagens.find((img: any) => img.principal) ?? imagens[0];

          return {
            ...item,
            produto: {
              ...item.produto,
              image: principal
                ? supabase.storage.from("produtos").getPublicUrl(principal.caminho).data.publicUrl
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

  async function enviarNovamenteParaCJ(pedido: {
    id: number;
    cj_order_id?: string | null;
    documento_fiscal?: string | null;
  }) {
    if (pedido.cj_order_id || enviandoId === pedido.id) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    setEnviandoId(pedido.id);

    try {
      const response = await fetch(`/api/admin/pedidos/${pedido.id}/enviar-cj/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documento_fiscal: documentos[pedido.id] ?? pedido.documento_fiscal ?? "",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? "Não foi possível enviar o pedido para a CJ.");
        return;
      }

      const orderId = data.orderIds?.[0] ?? null;
      setPedidos((pedidosAtuais) =>
        pedidosAtuais.map((item) =>
          item.id === pedido.id
            ? { ...item, cj_status: "sent", cj_order_id: orderId, cj_error: null }
            : item
        )
      );
    } catch (error) {
      console.error("Erro ao reenviar pedido para CJ:", error);
      alert("Não foi possível enviar o pedido para a CJ.");
    } finally {
      setEnviandoId(null);
    }
  }

  async function consultarStatusCJ() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setDiagnosticoCJ(JSON.stringify({ error: "Sessão expirada. Faça login novamente." }, null, 2));
      return;
    }

    setConsultandoStatusCJ(true);

    try {
      const response = await fetch("/api/admin/cj/status-test/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      setDiagnosticoCJ(JSON.stringify(data, null, 2));
    } catch (error) {
      setDiagnosticoCJ(
        JSON.stringify(
          { error: error instanceof Error ? error.message : "Não foi possível consultar a CJ." },
          null,
          2
        )
      );
    } finally {
      setConsultandoStatusCJ(false);
    }
  }

  async function sincronizarPedidoCJ(pedidoId: number) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setDiagnosticoCJ(JSON.stringify({ error: "Sessão expirada. Faça login novamente." }, null, 2));
      return;
    }

    setSincronizandoCJ(true);

    try {
      const response = await fetch(`/api/admin/pedidos/${pedidoId}/sync-cj/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      setDiagnosticoCJ(JSON.stringify(data, null, 2));
    } catch (error) {
      setDiagnosticoCJ(
        JSON.stringify(
          { error: error instanceof Error ? error.message : "Não foi possível sincronizar o pedido CJ." },
          null,
          2
        )
      );
    } finally {
      setSincronizandoCJ(false);
    }
  }

  async function confirmarCancelamento() {
    if (!pedidoParaCancelar) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    setCancelandoPedido(true);

    try {
      const response = await fetch(`/api/admin/pedidos/${pedidoParaCancelar.id}/cancelar/`, {
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
          item.id === pedidoParaCancelar.id
            ? { ...item, ...data }
            : item
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
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
          <h1 className="text-3xl font-bold text-slate-900">Pedidos</h1>
          <p className="mt-2 text-sm text-slate-600">
            Visualização consolidada de todos os pedidos do sistema.
          </p>
          </div>
          <button
            type="button"
            onClick={consultarStatusCJ}
            disabled={consultandoStatusCJ}
            className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {consultandoStatusCJ ? "Consultando CJ..." : "Diagnóstico CJ (IMB-10-1)"}
          </button>
        </div>

        {diagnosticoCJ && (
          <pre className="max-h-[32rem] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-100">
            {diagnosticoCJ}
          </pre>
        )}

        {carregando ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
            Carregando pedidos...
          </div>
        ) : pedidos.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
            Nenhum pedido encontrado.
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Pedido #{pedido.id}</h2>
                    <p className="text-sm text-slate-600">
                      Cliente: {pedido.id_usuario ?? "Não informado"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{traduzirStatusPedido(pedido.status)}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Total: R$ {Number(pedido.valorTotal ?? 0).toFixed(2)}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      CJ: {pedido.cj_status ? traduzirStatusPedido(pedido.cj_status) : "Não enviado"}
                      {pedido.cj_order_id ? ` (${pedido.cj_order_id})` : ""}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{new Date(pedido.created_at).toLocaleString("pt-BR")}</span>
                  </div>
                </div>

                {pedido.cj_error && (
                  <p className="mt-3 text-sm text-red-600">CJ: {pedido.cj_error}</p>
                )}

                {pedido.id === 10 && (
                  <button
                    type="button"
                    onClick={() => sincronizarPedidoCJ(pedido.id)}
                    disabled={sincronizandoCJ}
                    className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sincronizandoCJ ? "Sincronizando..." : "Sincronizar CJ"}
                  </button>
                )}

                {podeCancelarPedido(pedido.status) && (
                  <button
                    type="button"
                    onClick={() => setPedidoParaCancelar(pedido)}
                    className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Cancelar compra
                  </button>
                )}

                {!pedido.cj_order_id && (
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <label className="text-sm text-slate-600">
                      CPF/CNPJ
                      <input
                        value={documentos[pedido.id] ?? pedido.documento_fiscal ?? ""}
                        onChange={(event) =>
                          setDocumentos((documentosAtuais) => ({
                            ...documentosAtuais,
                            [pedido.id]: event.target.value.replace(/\D/g, "").slice(0, 14),
                          }))
                        }
                        inputMode="numeric"
                        placeholder="Somente números"
                        className="ml-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => enviarNovamenteParaCJ(pedido)}
                      disabled={enviandoId === pedido.id}
                      className="rounded-lg bg-violet-100 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {enviandoId === pedido.id ? "Enviando..." : "Enviar novamente para CJ"}
                    </button>
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  {(pedido.pedidoItem ?? []).map((item: any, index: number) => (
                    <div key={`${pedido.id}-${index}`} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        {item.produto?.image ? (
                          <img src={item.produto.image} alt={item.produto.nome} className="h-16 w-16 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500">
                            Sem imagem
                          </div>
                        )}

                        <div>
                          <p className="font-medium text-slate-900">{item.produto?.nome ?? "Produto não informado"}</p>
                          <p className="text-sm text-slate-600">Quantidade: {item.quantidade ?? 1}</p>
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-slate-900">
                      {Number(item.preco_unitario).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    </div>
                  ))}
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
              Informe o motivo do cancelamento do pedido #{pedidoParaCancelar.id}.
            </p>
            <textarea
              value={motivoCancelamento}
              onChange={(event) => setMotivoCancelamento(event.target.value)}
              placeholder="Motivo do cancelamento"
              rows={4}
              className="mt-4 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900"
            />
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
                disabled={cancelandoPedido}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelandoPedido ? "Cancelando..." : "Confirmar cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}