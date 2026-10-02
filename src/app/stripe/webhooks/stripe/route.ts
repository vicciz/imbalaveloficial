import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdminClient } from "@/src/services/products/repository/adminSupabase";
import { supabaseErrorMessage } from "@/src/services/products/repository/supabaseError";

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
import { enviarResumoPedidoPorEmail } from "@/src/services/email/pedidoEmail";

type WebhookUsuario = { id: number };
type WebhookEndereco = { id: number; cep?: string | null };
type WebhookPedido = { id: number; frete_detalhes?: unknown };

async function atualizarStatusCJErro(idPedido: number, error: unknown) {
  const mensagem = error instanceof Error ? error.message : "Erro desconhecido na CJ.";
  await atualizarIntegracaoCJ(idPedido, {
    cj_status: "error",
    cj_error: mensagem.slice(0, 2000),
  });
}

async function obterEmailUsuario(userId: string) {
  const supabaseAdmin = getSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error) {
    throw new Error(supabaseErrorMessage(error, "Falha ao buscar e-mail do cliente"));
  }

  const email = data.user?.email?.trim();
  if (!email) {
    throw new Error("O cliente do pedido não possui e-mail cadastrado.");
  }

  return email;
}

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: "2026-04-22.dahlia",
  }
);

type PedidoItemLink = {
  id_produto: number;
  id_variacao: number | null;
};

function parseSelectedItemIds(value: string | undefined): number[] {
  try {
    const selectedItemIds: unknown = JSON.parse(value ?? "");

    if (
      !Array.isArray(selectedItemIds) ||
      selectedItemIds.length === 0 ||
      selectedItemIds.some(
        (id) => typeof id !== "number" || !Number.isInteger(id) || id <= 0
      )
    ) {
      throw new Error("selectedItemIds inválido");
    }

    return selectedItemIds;
  } catch {
    throw new Error("selectedItemIds não encontrado ou inválido na metadata Stripe.");
  }
}

function pedidoItemKey(item: PedidoItemLink): string {
  return `${item.id_produto}:${item.id_variacao ?? "null"}`;
}

export async function POST(
  req: NextRequest
) {
  console.log("WEBHOOK RECEBIDO");

  const body = await req.text();

  const signature =
    req.headers.get(
      "stripe-signature"
    );

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Assinatura de webhook Stripe inválida:", error);
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId;
        const enderecoId = Number(session.metadata?.enderecoId);

        if (!userId) {
          throw new Error("UserId não encontrado na metadata Stripe.");
        }

        if (!Number.isInteger(enderecoId) || enderecoId <= 0) {
          throw new Error("EnderecoId inválido na metadata Stripe.");
        }

        const supabaseAdmin = getSupabaseAdminClient();
        const { data: usuarioData, error: erroUsuario } = await supabaseAdmin
          .from("usuario")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();
        const usuario = usuarioData as WebhookUsuario | null;

        if (erroUsuario) {
          throw new Error(supabaseErrorMessage(erroUsuario, "Falha ao buscar usuário do pedido"));
        }

        if (!usuario) {
          throw new Error("Usuário do pedido não encontrado.");
        }

        const { data: enderecoData, error: erroEndereco } = await supabaseAdmin
          .from("enderecos")
          .select("*")
          .eq("id", enderecoId)
          .eq("id_usuario", usuario.id)
          .maybeSingle();
        const endereco = enderecoData as WebhookEndereco | null;

        if (erroEndereco) {
          throw new Error(supabaseErrorMessage(erroEndereco, "Falha ao buscar endereço do pedido"));
        }

        if (!endereco) {
          throw new Error("Endereço do pedido não encontrado para o usuário.");
        }

        const selectedItemIds = parseSelectedItemIds(session.metadata?.selectedItemIds);
        const { data: pedidoExistenteData, error: erroBuscaPedido } =
          await buscarPedidoPorStripeSession(session.id);
        const pedidoExistente = pedidoExistenteData as WebhookPedido | null;

        if (erroBuscaPedido) {
          throw new Error(supabaseErrorMessage(erroBuscaPedido, "Falha ao verificar pedido Stripe"));
        }

        if (pedidoExistente) {
          const { data: itensExistentesData, error: erroItensExistentes } = await buscarItensPedido(pedidoExistente.id);
          const itensExistentes = itensExistentesData as PedidoItemLink[] | null;
          if (erroItensExistentes) {
            throw new Error(supabaseErrorMessage(erroItensExistentes, "Falha ao buscar itens do pedido existente"));
          }

          const chavesItensExistentes = new Set(
            ((itensExistentes ?? []) as PedidoItemLink[]).map(pedidoItemKey)
          );

          if (chavesItensExistentes.size < selectedItemIds.length) {
            const { data: itensCarrinho, error: erroCarrinho } = await buscarCarrinho(
              userId,
              selectedItemIds,
              supabaseAdmin
            );

            if (erroCarrinho) {
              throw new Error(supabaseErrorMessage(erroCarrinho, "Falha ao recuperar itens pendentes do carrinho"));
            }

            if (!itensCarrinho || itensCarrinho.length !== selectedItemIds.length) {
              throw new Error("Não foi possível reconciliar todos os itens do pedido existente.");
            }

            for (const item of itensCarrinho) {
              const key = pedidoItemKey({
                id_produto: item.id_produto,
                id_variacao: item.id_variacao,
              });

              if (chavesItensExistentes.has(key)) {
                continue;
              }

              const itemVariacao = item.variacao?.produto_variacao_item?.find(
                (variationItem: { ativo?: boolean | null }) => variationItem.ativo !== false
              );

              if (!itemVariacao) {
                throw new Error(`Nenhuma variação ativa encontrada para ${item.produto.nome}.`);
              }

              await adicionarItemPedido(
                pedidoExistente.id,
                item.id_produto,
                Number(item.quantidade),
                Number(itemVariacao.preco ?? 0),
                item.id_variacao
              );
              chavesItensExistentes.add(key);
            }
          }

          const { data: itensPedidoExistente, error: erroItensPedidoExistente } =
            await buscarItensPedido(pedidoExistente.id);
          if (erroItensPedidoExistente) {
            throw new Error(supabaseErrorMessage(erroItensPedidoExistente, "Falha ao confirmar itens do pedido existente"));
          }

          try {
            await enviarPedidoParaCJ({
              pedido: pedidoExistente,
              itens: itensPedidoExistente ?? [],
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

          try {
            const email = await obterEmailUsuario(userId);
            const totalExistente = Number((pedidoExistente as any).valor_total ?? 0);
            const freteExistente = Number((pedidoExistente as any).frete_total ?? 0);

            await enviarResumoPedidoPorEmail({
              to: email,
              pedidoId: pedidoExistente.id,
              total: totalExistente,
              frete: freteExistente,
              itens: itensPedidoExistente ?? [],
              endereco: endereco as Record<string, any>,
            });
          } catch (error) {
            console.error("[EMAIL] Erro ao enviar resumo do pedido existente", {
              pedidoId: pedidoExistente.id,
              error,
            });
          }

          break;
        }

        console.log(
          "Pagamento aprovado:",
          userId
        );

        // =====================
        // BUSCAR CARRINHO
        // =====================

        const { data: itens, error } = await buscarCarrinho(
          userId,
          selectedItemIds,
          supabaseAdmin
        );

        if (error) {
          throw new Error(supabaseErrorMessage(error, "Erro ao buscar carrinho"));
        }

        if (!itens?.length) {
          throw new Error("Carrinho vazio para os itens selecionados.");
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
          data: pedidoData,
          error: erroPedido,
        } = await criarPedido(
          userId,
          endereco.id,
          valorTotal,
          session.id,
          fretes
        );
        const pedido = pedidoData as WebhookPedido | null;
        if (erroPedido) {
          throw new Error(supabaseErrorMessage(erroPedido, "Falha ao criar pedido"));
        }

        if (!pedido) {
          throw new Error("Supabase não retornou o pedido criado.");
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

        const carrinhoRemovido = await removerItensDoCarrinho(
          userId,
          selectedItemIds,
          supabaseAdmin
        );

        if (!carrinhoRemovido) {
          throw new Error("Pedido criado, mas não foi possível limpar os itens do carrinho.");
        }

        console.log(
          "Carrinho limpo"
        );

        console.log(
          "Pedido criado com sucesso"
        );

        const { data: itensPedidoData, error: erroItensPedido } = await buscarItensPedido(pedido.id);
        const itensPedido = itensPedidoData as Record<string, unknown>[] | null;

        if (erroItensPedido) {
          throw new Error(
            supabaseErrorMessage(
              erroItensPedido,
              "Falha ao buscar itens do pedido"
            )
          );
        }

        try {
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

        try {
          const email = await obterEmailUsuario(userId);
          const freteTotal = Number(session.metadata?.frete_total_brl ?? 0);

          await enviarResumoPedidoPorEmail({
            to: email,
            pedidoId: pedido.id,
            total: valorTotal,
            frete: freteTotal,
            itens: itensPedido ?? [],
            endereco: endereco as Record<string, any>,
          });

          console.log("[EMAIL] Resumo do pedido enviado", {
            pedidoId: pedido.id,
            email,
          });
        } catch (error) {
          // O envio do e-mail não pode invalidar o pedido já pago.
          console.error("[EMAIL] Erro ao enviar resumo do pedido", {
            pedidoId: pedido.id,
            error,
          });
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

  } catch (err) {
    console.error(
      "Falha ao processar evento Stripe:",
      { eventId: event.id, eventType: event.type, error: err }
    );

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Falha ao processar evento Stripe.",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({ received: true });
}