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
} from "@/src/services/pedido/pedido";
import { metadata } from "@/src/app/layout";

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

        const {
          data: itens,
          error,
        } = await buscarCarrinho(
          userId,
          selectedItemIds
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
          calcularTotal(itens);

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
          valorTotal
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