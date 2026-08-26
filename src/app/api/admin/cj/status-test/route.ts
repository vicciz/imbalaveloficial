import { NextRequest, NextResponse } from "next/server";
import { buscarStatusPedido } from "@/src/services/cjdropshipping/status";
import { supabase } from "@/supabaseClient";

const CJ_ORDER_ID = "IMB-10-1";
const CJ_ENDPOINT = `/shopping/order/getOrderDetail?orderId=${encodeURIComponent(CJ_ORDER_ID)}`;

function mascararEmail(email: string) {
  const [local, dominio] = email.split("@", 2);
  if (!local || !dominio) return "<inválido>";
  return `${local.slice(0, 1)}***@${dominio}`;
}

function sanitizarResposta(resposta: unknown) {
  try {
    return JSON.parse(
      JSON.stringify(resposta, (key, value) => {
        if (typeof value !== "string") return value;
        if (key.toLowerCase().includes("email")) return mascararEmail(value);
        if (["token", "accessToken", "apiKey"].includes(key)) return "<oculto>";
        return value;
      })
    );
  } catch {
    return "<resposta não serializável>";
  }
}

function listarCampos(resposta: unknown, termos: string[]) {
  const campos: string[] = [];

  function visitar(valor: unknown, caminho: string) {
    if (!valor || typeof valor !== "object") return;

    for (const [chave, item] of Object.entries(valor)) {
      const caminhoAtual = caminho ? `${caminho}.${chave}` : chave;
      if (termos.some((termo) => chave.toLowerCase().includes(termo))) {
        campos.push(caminhoAtual);
      }
      visitar(item, caminhoAtual);
    }
  }

  visitar(resposta, "");
  return campos;
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!accessToken) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: authData, error: authError } =
    await supabase.auth.getUser(accessToken);

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuario")
    .select("role")
    .eq("user_id", authData.user.id)
    .single();

  if (usuarioError || usuario?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const resposta = await buscarStatusPedido(CJ_ORDER_ID);
    const respostaSanitizada = sanitizarResposta(resposta);

    return NextResponse.json({
      cjOrderId: CJ_ORDER_ID,
      endpoint: CJ_ENDPOINT,
      response: respostaSanitizada,
      statusFields: listarCampos(respostaSanitizada, ["status", "state"]),
      trackingFields: listarCampos(respostaSanitizada, [
        "track",
        "logistic",
        "shipment",
        "waybill",
        "carrier",
      ]),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao consultar a CJ.";

    return NextResponse.json(
      {
        cjOrderId: CJ_ORDER_ID,
        endpoint: CJ_ENDPOINT,
        error: message,
      },
      { status: 502 }
    );
  }
}
