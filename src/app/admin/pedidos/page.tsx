"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/src/components/layout/Admin";
import { supabase } from "@/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import {
  podeCancelarPedido,
  traduzirStatusCJ,
  traduzirStatusPedido,
} from "@/src/lib/status-pedido";

type UsuarioCancelamento = {
  user_id: string;
  nome: string;
  email: string | null;
};

type EventoCancelamento = {
  id: number;
  pedido_id: number;
  tipo: string;
  status_anterior: string | null;
  status_novo: string | null;
  motivo: string | null;
  dados: Record<string, unknown> | null;
  created_at: string;
};

type PedidoResumoCancelamento = {
  id: number;
  id_usuario: string;
  status?: string | null;
  cancelado_por?: string | null;
  cancelado_em?: string | null;
  motivo_cancelamento?: string | null;
  created_at?: string | null;
  valorTotal?: number | string | null;
  stripe_refund_id?: string | null;
  stripe_refund_status?: string | null;
  cj_status?: string | null;
  cj_order_id?: string | null;
  cj_order_ids?: unknown;
  cj_cancelamento_resultados?: unknown;
};

const FILTROS_STATUS = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "pending", rotulo: "Pendentes" },
  { valor: "paid", rotulo: "Pagos" },
  { valor: "processing", rotulo: "Em processamento" },
  { valor: "shipped", rotulo: "Enviados" },
  { valor: "delivered", rotulo: "Entregues" },
  { valor: "cancelled", rotulo: "Cancelados" },
];

function formatarDataHora(value?: string | null) {
  if (!value) return "Não informado";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Não informado" : date.toLocaleString("pt-BR");
}

function obterIdsPedidoCJ(pedido: PedidoResumoCancelamento) {
  const ids = (Array.isArray(pedido.cj_order_ids) ? pedido.cj_order_ids : [])
    .map((item: unknown) => {
      if (typeof item === "string" || typeof item === "number") return String(item);
      if (item && typeof item === "object") {
        return String((item as Record<string, unknown>).orderId ?? "");
      }
      return "";
    })
    .filter(Boolean);

  if (pedido.cj_order_id) ids.push(String(pedido.cj_order_id));
  return [...new Set(ids)];
}

function obterCanceladoPor(
  pedido: PedidoResumoCancelamento,
  usuarios: Record<string, UsuarioCancelamento>,
  evento?: EventoCancelamento
) {
  if (!pedido.cancelado_por) return "Não informado";

  const tipoEvento = evento?.dados?.cancelado_por_tipo;
  const tipo = tipoEvento === "cliente" || tipoEvento === "administrador"
    ? tipoEvento
    : pedido.cancelado_por === pedido.id_usuario
      ? "cliente"
      : "administrador";

  if (tipo === "cliente") return "Cancelado pelo cliente";

  const nomeAdmin = usuarios[pedido.cancelado_por]?.nome;
  return nomeAdmin
    ? `Cancelado pelo administrador — ${nomeAdmin}`
    : "Cancelado pelo administrador — nome não localizado";
}

function obterStatusRefund(pedido: PedidoResumoCancelamento) {
  if (pedido.stripe_refund_id) {
    return pedido.stripe_refund_status === "succeeded"
      ? "Processado"
      : pedido.stripe_refund_status ?? "Refund registrado";
  }
  if (pedido.stripe_refund_status === "not_applicable") return "Não aplicável";
  if (pedido.stripe_refund_status === "failed") return "Falhou";
  return "Não registrado";
}

function obterResultadoCJCancelamento(pedido: PedidoResumoCancelamento) {
  if (!obterIdsPedidoCJ(pedido).length) return "Sem pedido associado na CJ";

  const resultadosSalvos = pedido.cj_cancelamento_resultados;
  const resultados = resultadosSalvos && typeof resultadosSalvos === "object" && !Array.isArray(resultadosSalvos)
    ? Object.values(resultadosSalvos as Record<string, unknown>) as Array<{
        status?: string;
        action?: string;
        result?: string;
      }>
    : [];
  if (!resultados.length) return "Sem resultado de cancelamento registrado";
  if (resultados.some((item) => item.action === "DELETE" && item.result === "sucesso")) {
    return "Removido na CJ";
  }
  if (resultados.some((item) => item.result === "delete_pending")) {
    return "Exclusão enviada; confirmação pendente";
  }
  const naoRemovidos = resultados.filter((item) => item.action === "none");
  if (naoRemovidos.length) {
    return `Não removido pela CJ (${naoRemovidos.map((item) => item.status).filter(Boolean).join(", ")})`;
  }
  return "Resultado não disponível";
}


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
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [usuariosCancelamento, setUsuariosCancelamento] = useState<Record<string, UsuarioCancelamento>>({});
  const [eventosCancelamento, setEventosCancelamento] = useState<Record<number, EventoCancelamento[]>>({});
  const [historicoCancelamentoDisponivel, setHistoricoCancelamentoDisponivel] = useState(true);
  const [pedidoParaDetalhes, setPedidoParaDetalhes] = useState<PedidoResumoCancelamento | null>(null);

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

      const pedidosCancelados = pedidosNormalizados.filter(
        (pedido) => pedido.status === "cancelled"
      );
      if (pedidosCancelados.length) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) throw new Error("Sessão administrativa expirada.");

          const usuariosPorId: Record<string, UsuarioCancelamento> = {};
          const eventosPorPedido: Record<number, EventoCancelamento[]> = {};
          let eventosDisponiveis = true;

          for (let offset = 0; offset < pedidosCancelados.length; offset += 250) {
            const lote = pedidosCancelados.slice(offset, offset + 250);
            const pedidoIds = lote.map((pedido) => pedido.id);
            const userIds = [...new Set(
              lote.flatMap((pedido) => [pedido.id_usuario, pedido.cancelado_por].filter(Boolean))
            )];
            const response = await fetch("/api/admin/pedidos/cancelamentos", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ pedidoIds, userIds }),
            });
            const metadata = await response.json();
            if (!response.ok) {
              throw new Error(metadata.error ?? "Falha ao carregar detalhes de cancelamentos.");
            }

            for (const usuario of (metadata.users ?? []) as UsuarioCancelamento[]) {
              usuariosPorId[usuario.user_id] = usuario;
            }
            for (const evento of (metadata.events ?? []) as EventoCancelamento[]) {
              eventosPorPedido[evento.pedido_id] ??= [];
              eventosPorPedido[evento.pedido_id].push(evento);
            }
            eventosDisponiveis = eventosDisponiveis && metadata.eventsAvailable === true;
          }

          setUsuariosCancelamento(usuariosPorId);
          setEventosCancelamento(eventosPorPedido);
          setHistoricoCancelamentoDisponivel(eventosDisponiveis);
        } catch (error) {
          console.error("Falha ao carregar metadata de cancelamento:", error);
          setHistoricoCancelamentoDisponivel(false);
        }
      } else {
        setUsuariosCancelamento({});
        setEventosCancelamento({});
        setHistoricoCancelamentoDisponivel(true);
      }

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
      const pedidoParaDiagnostico = pedidos.find(
        (item) => item.cj_order_code || item.cj_order_id
      );

      if (!pedidoParaDiagnostico) {
        setDiagnosticoCJ(
          JSON.stringify(
            { error: "Nenhum pedido com identificador da CJ disponível para diagnóstico." },
            null,
            2
          )
        );
        return;
      }

      const orderId =
        pedidoParaDiagnostico.cj_order_code || pedidoParaDiagnostico.cj_order_id;
      const response = await fetch(
        `/api/admin/cj/status-test/?orderId=${encodeURIComponent(orderId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok && data?.id) {
        setPedidos((pedidosAtuais) =>
          pedidosAtuais.map((item) =>
            item.id === pedidoParaDiagnostico.id ? { ...item, ...data } : item
          )
        );
      }

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

      if (response.ok && data?.id) {
        // A rota de sincronização já persistiu o retorno da CJ no banco.
        // Atualizamos também a lista local para refletir imediatamente o
        // status real (por exemplo, UNPAID) sem exigir F5.
        setPedidos((pedidosAtuais) =>
          pedidosAtuais.map((item) =>
            item.id === pedidoId
              ? {
                  ...item,
                  ...data,
                  cj_status: data.cj_status ?? item.cj_status,
                  cj_order_id: data.cj_order_id ?? item.cj_order_id,
                  cj_order_code: data.cj_order_code ?? item.cj_order_code,
                  cj_internal_order_id:
                    data.cj_internal_order_id ?? item.cj_internal_order_id,
                  cj_tracking_code:
                    data.cj_tracking_code ?? item.cj_tracking_code,
                  cj_tracking_provider:
                    data.cj_tracking_provider ?? item.cj_tracking_provider,
                  cj_tracking_url:
                    data.cj_tracking_url ?? item.cj_tracking_url,
                }
              : item
          )
        );
      }

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

      try {
        const metadataResponse = await fetch("/api/admin/pedidos/cancelamentos", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pedidoIds: [data.id],
            userIds: [data.id_usuario, data.cancelado_por].filter(Boolean),
          }),
        });
        const metadata = await metadataResponse.json();
        if (metadataResponse.ok) {
          setUsuariosCancelamento((usuariosAtuais) => ({
            ...usuariosAtuais,
            ...Object.fromEntries(
              (metadata.users ?? []).map((usuario: UsuarioCancelamento) => [usuario.user_id, usuario])
            ),
          }));
          setEventosCancelamento((eventosAtuais) => ({
            ...eventosAtuais,
            [data.id]: metadata.events ?? [],
          }));
          setHistoricoCancelamentoDisponivel(metadata.eventsAvailable === true);
        } else {
          console.error("Cancelamento salvo, mas o histórico não atualizou:", metadata.error);
        }
      } catch (error) {
        console.error("Cancelamento salvo, mas o histórico não atualizou:", error);
      }

      setPedidoParaCancelar(null);
      setMotivoCancelamento("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Não foi possível cancelar o pedido.");
    } finally {
      setCancelandoPedido(false);
    }
  }

  const pedidosFiltrados = filtroStatus === "todos"
    ? pedidos
    : pedidos.filter((pedido) => pedido.status === filtroStatus);

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
            {consultandoStatusCJ
              ? "Consultando CJ..."
              : "Diagnóstico CJ (pedido selecionado)"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4">
          <label htmlFor="filtro-status-pedidos" className="text-sm font-medium text-slate-700">
            Filtrar pedidos
          </label>
          <select
            id="filtro-status-pedidos"
            value={filtroStatus}
            onChange={(event) => setFiltroStatus(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {FILTROS_STATUS.map((filtro) => (
              <option key={filtro.valor} value={filtro.valor}>{filtro.rotulo}</option>
            ))}
          </select>
          <span className="text-sm text-slate-500">
            {pedidosFiltrados.length} de {pedidos.length} pedidos
          </span>
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
        ) : pedidosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
            {pedidos.length === 0
              ? "Nenhum pedido encontrado."
              : "Nenhum pedido corresponde ao filtro selecionado."}
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosFiltrados.map((pedido) => {
              const eventoCancelamento = eventosCancelamento[pedido.id]?.[0];
              const usuarioCliente = usuariosCancelamento[pedido.id_usuario];
              const idsCJ = obterIdsPedidoCJ(pedido);
              const canceladoPor = obterCanceladoPor(pedido, usuariosCancelamento, eventoCancelamento);
              const cancelado = pedido.status === "cancelled";

              return (
              <div key={pedido.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Pedido #{pedido.id}</h2>
                    <p className="text-sm text-slate-600">
                      Cliente: {usuarioCliente?.nome ?? pedido.id_usuario ?? "Não informado"}
                    </p>
                    {usuarioCliente?.email && (
                      <p className="text-sm text-slate-500">{usuarioCliente.email}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className={`rounded-full px-3 py-1 ${cancelado ? "bg-red-100 font-semibold text-red-800" : "bg-slate-100"}`}>
                      {cancelado ? "Cancelado" : traduzirStatusPedido(pedido.status)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Total: R$ {Number(pedido.valorTotal ?? 0).toFixed(2)}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      CJ: {pedido.cj_status ? traduzirStatusCJ(pedido.cj_status) : "Não enviado"}
                      {pedido.cj_order_id ? ` (${pedido.cj_order_id})` : ""}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{formatarDataHora(pedido.created_at)}</span>
                  </div>
                </div>

                {cancelado && (
                  <section className="mt-4 border-l-4 border-red-500 bg-red-50 p-4 text-sm text-slate-700">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <p><span className="font-semibold">Cancelado em:</span> {formatarDataHora(pedido.cancelado_em)}</p>
                      <p><span className="font-semibold">Cancelado por:</span> {canceladoPor}</p>
                      <p><span className="font-semibold">Refund:</span> {obterStatusRefund(pedido)}</p>
                      <p className="sm:col-span-2"><span className="font-semibold">Motivo:</span> {pedido.motivo_cancelamento || "Não informado"}</p>
                      <p><span className="font-semibold">CJ:</span> {pedido.cj_status ? traduzirStatusCJ(pedido.cj_status) : "Não enviado"}</p>
                      <p className="sm:col-span-2"><span className="font-semibold">CJ order ID:</span> {idsCJ.length ? idsCJ.join(", ") : "Não informado"}</p>
                      <p><span className="font-semibold">Resultado CJ:</span> {obterResultadoCJCancelamento(pedido)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 border-red-200 bg-white text-red-800 hover:bg-red-100"
                      onClick={() => setPedidoParaDetalhes(pedido)}
                    >
                      Ver detalhes
                    </Button>
                  </section>
                )}

                {pedido.cj_error && (
                  <p className="mt-3 text-sm text-red-600">CJ: {pedido.cj_error}</p>
                )}

                {pedido.cj_order_id || pedido.cj_order_code || pedido.cj_internal_order_id ? (
                  <button
                    type="button"
                    onClick={() => sincronizarPedidoCJ(pedido.id)}
                    disabled={sincronizandoCJ}
                    className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sincronizandoCJ ? "Sincronizando..." : "Sincronizar CJ"}
                  </button>
                ) : null}

                {podeCancelarPedido(pedido.status, pedido.cj_status) && (
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
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(pedidoParaCancelar)}
        onOpenChange={(open) => {
          if (!open && !cancelandoPedido) {
            setPedidoParaCancelar(null);
            setMotivoCancelamento("");
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md p-6" showCloseButton={!cancelandoPedido}>
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Confirmar cancelamento do pedido #{pedidoParaCancelar?.id}
            </DialogTitle>
            <DialogDescription>
              Esta ação altera o pedido local, tenta remover o pedido da CJ quando possível e solicita o estorno se houve pagamento.
            </DialogDescription>
          </DialogHeader>
          <label className="block text-sm font-medium text-slate-700">
            Motivo do cancelamento
            <textarea
              value={motivoCancelamento}
              onChange={(event) => setMotivoCancelamento(event.target.value)}
              placeholder="Motivo do cancelamento (opcional)"
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900"
            />
          </label>
          <DialogFooter className="mx-0 mb-0 flex-col-reverse rounded-none border-0 bg-transparent p-0 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPedidoParaCancelar(null);
                setMotivoCancelamento("");
              }}
              disabled={cancelandoPedido}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmarCancelamento}
              disabled={cancelandoPedido}
            >
              {cancelandoPedido ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pedidoParaDetalhes)}
        onOpenChange={(open) => {
          if (!open) setPedidoParaDetalhes(null);
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-h-[calc(100vh-2rem)] max-w-3xl overflow-y-auto p-6">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Cancelamento do pedido #{pedidoParaDetalhes?.id}
            </DialogTitle>
            <DialogDescription>
              Dados principais do pedido e histórico disponível do cancelamento.
            </DialogDescription>
          </DialogHeader>

          {pedidoParaDetalhes && (() => {
            const eventos = eventosCancelamento[pedidoParaDetalhes.id] ?? [];
            const evento = eventos[0];
            const cliente = usuariosCancelamento[pedidoParaDetalhes.id_usuario];
            const idsCJ = obterIdsPedidoCJ(pedidoParaDetalhes);

            return (
              <div className="space-y-6">
                <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Cliente</dt>
                    <dd className="mt-1 text-sm text-slate-900">{cliente?.nome ?? pedidoParaDetalhes.id_usuario}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">E-mail</dt>
                    <dd className="mt-1 text-sm text-slate-900">{cliente?.email ?? "Não localizado"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Data do pedido</dt>
                    <dd className="mt-1 text-sm text-slate-900">{formatarDataHora(pedidoParaDetalhes.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Cancelado em</dt>
                    <dd className="mt-1 text-sm text-slate-900">{formatarDataHora(pedidoParaDetalhes.cancelado_em)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Status anterior</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {evento?.status_anterior ? traduzirStatusPedido(evento.status_anterior) : "Não registrado no histórico"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Cancelado por</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {obterCanceladoPor(pedidoParaDetalhes, usuariosCancelamento, evento)}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase text-slate-500">Motivo</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
                      {pedidoParaDetalhes.motivo_cancelamento || evento?.motivo || "Não informado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Refund Stripe</dt>
                    <dd className="mt-1 text-sm text-slate-900">{obterStatusRefund(pedidoParaDetalhes)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">ID do refund</dt>
                    <dd className="mt-1 break-all text-sm text-slate-900">{pedidoParaDetalhes.stripe_refund_id || "Não disponível"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Status CJ</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {pedidoParaDetalhes.cj_status ? traduzirStatusCJ(pedidoParaDetalhes.cj_status) : "Não enviado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">Identificador CJ</dt>
                    <dd className="mt-1 break-all text-sm text-slate-900">{idsCJ.join(", ") || "Não disponível"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase text-slate-500">Resultado da ação na CJ</dt>
                    <dd className="mt-1 text-sm text-slate-900">{obterResultadoCJCancelamento(pedidoParaDetalhes)}</dd>
                  </div>
                </dl>

                <section className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900">Histórico de cancelamento</h3>
                  {!historicoCancelamentoDisponivel ? (
                    <p className="mt-2 text-sm text-slate-500">Histórico de eventos indisponível; os dados principais acima vêm do pedido.</p>
                  ) : eventos.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">Nenhum evento ORDER_CANCELLED registrado para este pedido.</p>
                  ) : (
                    <ol className="mt-3 space-y-3">
                      {eventos.map((item) => (
                        <li key={item.id} className="border-l-2 border-red-300 pl-3">
                          <p className="text-sm font-medium text-slate-900">{item.tipo}</p>
                          <p className="text-sm text-slate-600">
                            {item.status_anterior ?? "desconhecido"} → {item.status_novo ?? "desconhecido"}
                          </p>
                          <p className="text-xs text-slate-500">{formatarDataHora(item.created_at)}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
                <DialogFooter className="mx-0 mb-0 rounded-none border-0 bg-transparent p-0">
                  <Button type="button" variant="outline" onClick={() => setPedidoParaDetalhes(null)}>
                    Fechar
                  </Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}