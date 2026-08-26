import { NextRequest, NextResponse } from "next/server";
import { sincronizarPedidosCJ } from "@/src/services/cjdropshipping/syncOrders";

let sincronizacaoEmAndamento = false;

async function executarSincronizacao(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();
  const expectedAuthorization = cronSecret ? `Bearer ${cronSecret}` : "";

  if (!cronSecret || authorization !== expectedAuthorization) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (sincronizacaoEmAndamento) {
    return NextResponse.json(
      { error: "Já existe uma sincronização CJ em andamento." },
      { status: 409 }
    );
  }

  sincronizacaoEmAndamento = true;

  try {
    const resultado = await sincronizarPedidosCJ();

    return NextResponse.json({
      sincronizados: resultado.sincronizados,
      erros: resultado.erros,
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Não foi possível sincronizar os pedidos CJ.";

    return NextResponse.json(
      {
        sincronizados: 0,
        erros: [{ id: null, error: message }],
      },
      { status: 502 }
    );
  } finally {
    sincronizacaoEmAndamento = false;
  }
}

export const GET = executarSincronizacao;
export const POST = executarSincronizacao;
