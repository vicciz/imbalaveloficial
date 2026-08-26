import { NextRequest, NextResponse } from "next/server";
import { buscarEndereco } from "@/src/services/usuario/enderecos";
import {
  atualizarIntegracaoCJ,
  buscarItensPedido,
} from "@/src/services/pedido/pedido";
import { enviarPedidoParaCJ } from "@/src/services/cjdropshipping/sendOrder";
import { supabase } from "@/supabaseClient";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id } = await context.params;
  const pedidoId = Number(id);
  const body = await request.json().catch(() => ({}));
  const documentoFiscal = String(body.documento_fiscal ?? "").replace(/\D/g, "");

  if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedido")
    .select("*")
    .eq("id", pedidoId)
    .single();

  if (pedidoError || !pedido) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  if (pedido.cj_order_id) {
    return NextResponse.json(
      { error: "Este pedido já possui um pedido CJ.", cj_order_id: pedido.cj_order_id },
      { status: 409 }
    );
  }

  if (documentoFiscal && ![11, 14].includes(documentoFiscal.length)) {
    return NextResponse.json({ error: "CPF/CNPJ inválido." }, { status: 400 });
  }

  if (documentoFiscal) {
    const { error: documentoError } = await supabase
      .from("pedido")
      .update({ documento_fiscal: documentoFiscal })
      .eq("id", pedidoId);

    if (documentoError) {
      return NextResponse.json({ error: "Não foi possível salvar o CPF/CNPJ." }, { status: 500 });
    }

    await supabase
      .from("usuario")
      .update({ documento_fiscal: documentoFiscal })
      .eq("user_id", pedido.id_usuario);

    pedido.documento_fiscal = documentoFiscal;
  }

  const { data: endereco, error: enderecoError } = await buscarEndereco(
    Number(pedido.id_endereco)
  );
  const { data: itens, error: itensError } = await buscarItensPedido(pedidoId);

  if (enderecoError || !endereco || itensError || !itens?.length) {
    return NextResponse.json(
      { error: "Não foi possível carregar endereço e itens do pedido." },
      { status: 422 }
    );
  }

  try {
    const resultado = await enviarPedidoParaCJ({
      pedido,
      itens,
      endereco,
      stripeMetadata: {},
      freteDetalhes: pedido.frete_detalhes,
    });

    return NextResponse.json(resultado);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido na CJ.";

    console.error("[CJ] Erro no reenvio administrativo", {
      pedidoId,
      error,
    });

    await atualizarIntegracaoCJ(pedidoId, {
      cj_status: "error",
      cj_error: message.slice(0, 2000),
    });

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
