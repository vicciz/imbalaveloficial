import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { buscarEndereco } from "@/src/services/usuario/enderecos";

//Rode no terminal  stripe listen --forward-to localhost:3000/stripe/webhooks/stripe/
import {
  buscarCarrinho,
  calcularTotal,
  removerItensDoCarrinho,
} from "@/src/services/carrinho/cart";
import {
  criarPedido,
  adicionarItemPedido,
  buscarPedidoPorStripeSession,
  buscarItensPedido,
  atualizarIntegracaoCJ,
} from "@/src/services/pedido/pedido";
import { enviarPedidoParaCJ } from "@/src/services/cjdropshipping/sendOrder";

async function atualizarStatusCJErro(idPedido: number, error: unknown) {
  const mensagem = error instanceof Error ? error.message : "Erro desconhecido na CJ.";
  await atualizarIntegracaoCJ(idPedido, {
    cj_status: "error",
    cj_error: mensagem.slice(0, 2000),
  });
}

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: "2026-04-22.dahlia",
  }
);

export async function POST(
  req: NextRequest
) {
  console.log("WEBHOOK RECEBIDO");

  const body = await req.text();

  const signature =
    req.headers.get(
      "stripe-signature"
    );

  try {
    const event =
      stripe.webhooks.constructEvent(
        body,
        signature!,
        process.env
          .STRIPE_WEBHOOK_SECRET!
      );

    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        const userId =
          session.metadata?.userId;
          const enderecoId = Number(
            session.metadata?.enderecoId
          );
          const {
            data: endereco,
            error: erroEndereco,
          } = await buscarEndereco(enderecoId);

          if (!endereco) {
            console.error("Endereço não encontrado");
            break;
          }

        if (!userId) {
          console.error(
            "UserId não encontrado"
          );
          break;
        }

        const { data: pedidoExistente, error: erroBuscaPedido } =
          await buscarPedidoPorStripeSession(session.id);

        if (erroBuscaPedido) {
          console.error("Erro ao verificar pedido Stripe:", erroBuscaPedido);
          break;
        }

        if (pedidoExistente) {
          const { data: itensExistentes } = await buscarItensPedido(pedidoExistente.id);
          try {
            await enviarPedidoParaCJ({
              pedido: pedidoExistente,
              itens: itensExistentes ?? [],
              endereco,
              stripeMetadata: session.metadata ?? {},
              freteDetalhes: pedidoExistente.frete_detalhes,
            });
          } catch (error) {
            console.error("[CJ] Erro ao reenviar pedido existente", {
              pedidoId: pedidoExistente.id,
              error,
            });
          }
          break;
        }

        const selectedItemIdsMetadata =
          session.metadata?.selectedItemIds;
        let selectedItemIds: number[];

        try {
          const parsedSelectedItemIds = JSON.parse(
            selectedItemIdsMetadata ?? ""
          );

          if (
            !Array.isArray(parsedSelectedItemIds) ||
            !parsedSelectedItemIds.length ||
            parsedSelectedItemIds.some(
              (id) =>
                typeof id !== "number" ||
                !Number.isInteger(id) ||
                id <= 0
            )
          ) {
            throw new Error("selectedItemIds inválido");
          }

          selectedItemIds = parsedSelectedItemIds;
        } catch {
          console.error(
            "selectedItemIds não encontrado ou inválido na metadata"
          );
          break;
        }

        console.log(
          "Pagamento aprovado:",
          userId
        );

        // =====================
        // BUSCAR CARRINHO
        // =====================

        const { data: itensTodos, error } = await buscarCarrinho(userId);
        const itens = itensTodos?.filter((item) =>
          selectedItemIds.includes(Number(item.id))
        );

        if (error) {
          console.error(
            "Erro ao buscar carrinho:",
            error
          );
          break;
        }

        if (!itens?.length) {
          console.error(
            "Carrinho vazio"
          );
          break;
        }

        console.log(
          "Itens:",
          itens
        );

        // =====================
        // CALCULAR TOTAL
        // =====================

        const valorTotal =
          session.amount_total != null
            ? session.amount_total / 100
            : calcularTotal(itens) + Number(session.metadata?.frete_total_brl ?? 0);

        let fretes: unknown = null;
        if (session.metadata?.fretes) {
          try {
            fretes = JSON.parse(session.metadata.fretes);
          } catch (error) {
            console.error("Metadata de fretes inválida:", error);
          }
        }

        console.log(
          "Valor Total:",
          valorTotal
        );

        // =====================
        // CRIAR PEDIDO
        // =====================

        const {
          data: pedido,
          error: erroPedido,
        } = await criarPedido(
          userId,
          endereco.id,
          valorTotal,
          session.id,
          fretes
        );
        console.log(
          "Pedido:",
          pedido
        );

        console.log(
          "Erro Pedido:",
          erroPedido
        );

        if (!pedido) {
          console.error(
            "Pedido não criado"
          );
          break;
        }

        // =====================
        // CRIAR ITENS DO PEDIDO
        // =====================

        for (const item of itens) {
          const precoUnitario =
          Number(
            item.variacao?.produto_variacao_item?.[0]?.preco ??
            Number(item.subtotal)??
            0
          );

        await adicionarItemPedido(
          pedido.id,
          item.id_produto,
          Number(item.quantidade),
          precoUnitario,
          item.id_variacao
        );
        }

        console.log(
          "Itens do pedido criados"
        );

        // =====================
        // LIMPAR CARRINHO
        // =====================

        await removerItensDoCarrinho(
          userId,
          selectedItemIds
        );

        console.log(
          "Carrinho limpo"
        );

        console.log(
          "Pedido criado com sucesso"
        );

        try {
          const { data: itensPedido } = await buscarItensPedido(pedido.id);
          await enviarPedidoParaCJ({
            pedido,
            itens: itensPedido ?? [],
            endereco,
            stripeMetadata: session.metadata ?? {},
            freteDetalhes: fretes,
          });
        } catch (error) {
          console.error("[CJ] Erro ao enviar pedido", {
            pedidoId: pedido.id,
            error,
          });
          await atualizarStatusCJErro(pedido.id, error);
        }

        break;
      }

      case "payment_intent.payment_failed": {
        console.log(
          "Pagamento recusado"
        );
        break;
      }

      default: {
        console.log(
          "Evento recebido:",
          event.type
        );
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (err) {
    console.error(
      "ERRO WEBHOOK:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Webhook inválido",
      },
      {
        status: 400,
      }
    );
  }
}