import { supabase } from "@/supabaseClient";
import { criarPedido as criarPedidoCJ } from "./orders";
import { atualizarIntegracaoCJ } from "@/src/services/pedido/pedido";

type Endereco = {
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
};

type CjFreteItem = {
  produtoId: number | null;
  produtoNome: string;
  quantidade: number;
  variantId: string | null;
  variantSku: string | null;
};

type CjFreteGroup = {
  key: string;
  provider: string;
  originCountryCode: string;
  serviceName: string;
  items: CjFreteItem[];
};

function digits(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function formatPostcode(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  return value;
}

function normalizeCountry(value: string | null | undefined) {
  const country = String(value ?? "Brasil").trim();
  if (country.length === 2) return country.toUpperCase();
  return "BR";
}

function isLikelyCjVid(value: string | null | undefined) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value ?? "")
  );
}

function makeProductIdentifier(item: any) {
  const fornecedorSku = String(
    item?.variacao?.produto_variacao_item?.find?.((v: any) => v.ativo !== false)?.fornecedor_sku ??
      ""
  ).trim();
  const sku = String(
    item?.variacao?.produto_variacao_item?.find?.((v: any) => v.ativo !== false)?.sku ??
      ""
  ).trim();

  return {
    vid: isLikelyCjVid(fornecedorSku) ? fornecedorSku : undefined,
    cjSku: isLikelyCjVid(fornecedorSku) ? sku || undefined : fornecedorSku || sku || undefined,
  };
}

function matchesFreteItem(orderItem: any, freightItem: CjFreteItem) {
  if (Number(orderItem.id_produto) !== Number(freightItem.produtoId)) return false;

  const identifier = makeProductIdentifier(orderItem);
  const variantId = String(freightItem.variantId ?? "").trim();
  const variantSku = String(freightItem.variantSku ?? "").trim();

  return Boolean(
    (variantId && (variantId === identifier.vid || variantId === identifier.cjSku)) ||
      (variantSku && (variantSku === identifier.cjSku || variantSku === identifier.vid))
  );
}

function parseFretes(metadataValue: string | undefined): CjFreteGroup[] {
  if (!metadataValue) return [];

  try {
    const parsed = JSON.parse(metadataValue);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (group): group is CjFreteGroup =>
        group &&
        group.provedor === "cj" &&
        typeof group.origem === "string" &&
        typeof group.servico === "string" &&
        Array.isArray(group.produtos)
    ).map((group: any) => ({
      key: String(group.key ?? ""),
      provider: "cj",
      originCountryCode: String(group.origem ?? "CN").toUpperCase(),
      serviceName: String(group.servico),
      items: group.produtos as CjFreteItem[],
    }));
  } catch {
    return [];
  }
}

async function carregarCliente(userId: string) {
  const { data } = await supabase
    .from("usuario")
    .select("nome, email, telefone, documento_fiscal")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    nome: String(data?.nome ?? "Cliente Imbalável").trim(),
    email: String(data?.email ?? "").trim(),
    telefone: String(data?.telefone ?? "").trim(),
    documentoFiscal: String(data?.documento_fiscal ?? "").replace(/\D/g, ""),
  };
}

function mascararEmail(email: string) {
  const [local, dominio] = email.split("@", 2);
  if (!local || !dominio) return "<inválido>";
  return `${local.slice(0, 1)}***@${dominio}`;
}

function mascararDocumento(documento: string) {
  return `***${documento.slice(-4)}`;
}

function sanitizarRespostaCJ(resposta: unknown) {
  try {
    return JSON.parse(
      JSON.stringify(resposta, (key, value) => {
        if (key === "email" && typeof value === "string") {
          return mascararEmail(value);
        }
        if (key === "taxId" && typeof value === "string") {
          return mascararDocumento(value);
        }
        return value;
      })
    );
  } catch {
    return "<resposta CJ não serializável>";
  }
}

function extrairOrderIdCJ(resposta: any) {
  if (typeof resposta?.data === "string") {
    return resposta.data.trim();
  }

  const candidatos = [
    resposta?.data?.orderId,
    resposta?.data?.id,
    resposta?.orderId,
    resposta?.data?.orderNo,
    resposta?.orderNo,
    resposta?.data?.orderNumber,
  ];

  return candidatos.map((valor) => String(valor ?? "").trim()).find(Boolean) ?? "";
}

export async function enviarPedidoParaCJ(params: {
  pedido: any;
  itens: any[];
  endereco: Endereco;
  stripeMetadata: Record<string, string | undefined>;
  freteDetalhes?: unknown;
}) {
  const { pedido, itens, endereco, stripeMetadata } = params;

  if (!pedido?.id) throw new Error("Pedido local inválido.");

  if (pedido.cj_status === "sent" || pedido.cj_status === "processing") {
    return { skipped: true, orderIds: pedido.cj_order_ids ?? [] };
  }

  const fretes = Array.isArray(params.freteDetalhes)
    ? parseFretes(JSON.stringify(params.freteDetalhes))
    : parseFretes(stripeMetadata.fretes);
  if (!fretes.length) {
    throw new Error("O checkout não registrou uma modalidade de frete CJ para este pedido.");
  }

  const cliente = await carregarCliente(String(pedido.id_usuario));
  const emailNormalizado = cliente.email.trim().toLowerCase();
  const documentoFiscal = String(
    pedido.documento_fiscal ?? cliente.documentoFiscal ?? ""
  ).replace(/\D/g, "");

  if (![11, 14].includes(documentoFiscal.length)) {
    throw new Error(
      "CPF/CNPJ do cliente não informado. Não é possível enviar o pedido para a CJ."
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
    throw new Error("E-mail do cliente não informado ou inválido.");
  }
  const existingResults = Array.isArray(pedido.cj_order_ids) ? pedido.cj_order_ids : [];
  const orderResults: any[] = [...existingResults];
  const orderIds: string[] = orderResults.map((item: any) => String(item?.orderId ?? "")).filter(Boolean);

  for (const grupo of fretes) {
    if (grupo.key && orderResults.some((item: any) => item?.groupKey === grupo.key)) {
      continue;
    }

    const grupoItens = itens.filter((item) =>
      grupo.items.some((freteItem) => matchesFreteItem(item, freteItem))
    );

    if (!grupoItens.length) continue;

    const products = grupoItens.map((item) => {
      const identifier = makeProductIdentifier(item);
      if (!identifier.vid && !identifier.cjSku) {
        throw new Error(
          `O produto ${item?.produto?.nome ?? item.id_produto} não possui VID/SKU da CJ.`
        );
      }

      const options = (item?.variacao?.produto_variacao_item ?? [])
        .map((variationItem: any) => {
          const type = variationItem?.variacao_valor?.variacao_tipo?.nome;
          const value = variationItem?.variacao_valor?.valor;
          return type && value ? `${type}: ${value}` : null;
        })
        .filter(Boolean)
        .join("-");

      return {
        ...(identifier.vid ? { vid: identifier.vid } : {}),
        ...(identifier.cjSku ? { variantSku: identifier.cjSku } : {}),
        quantity: Math.max(1, Number(item.quantidade) || 1),
        storeProductId: String(item.id_produto),
        storeProductName: String(item?.produto?.nome ?? "Produto Imbalável"),
        ...(options ? { variantOptions: options } : {}),
        storeLineItemId: String(item.id),
      };
    });

    const payload = {
      orderNumber: `IMB-${pedido.id}-${orderIds.length + 1}`,
      shippingZip: formatPostcode(endereco.cep),
      shippingCountryCode: "BR",
      shippingCountry: "Brasil",
      shippingProvince: String(endereco.estado ?? "SP"),
      shippingCity: String(endereco.cidade ?? ""),
      shippingAddress: String(endereco.logradouro ?? ""),
      ...(endereco.complemento || endereco.bairro
        ? {
            shippingAddress2: [endereco.complemento, endereco.bairro]
              .filter(Boolean)
              .join(", "),
          }
        : {}),
      shippingCustomerName: cliente.nome,
      email: emailNormalizado,
      taxId: documentoFiscal,
      ...(cliente.telefone ? { shippingPhone: cliente.telefone } : {}),
      ...(endereco.numero ? { houseNumber: String(endereco.numero) } : {}),
      remark: `Pedido Imbalável #${pedido.id}`,
      logisticName: grupo.serviceName,
      fromCountryCode: normalizeCountry(grupo.originCountryCode),
      platform: "Api",
      payType: (process.env.CJ_PAY_TYPE === "2" ? 2 : 3) as 2 | 3,
      orderFlow: 1 as const,
      products,
    };

    console.log("[CJ] Payload sanitizado:", {
      ...payload,
      email: mascararEmail(emailNormalizado),
      taxId: mascararDocumento(documentoFiscal),
    });

    const response = await criarPedidoCJ(payload);
    const respostaSanitizada = sanitizarRespostaCJ(response);
    console.log("[CJ] Resposta bruta sanitizada:", respostaSanitizada);
    const orderId = extrairOrderIdCJ(response);

    if (!orderId) {
      throw new Error(`A CJ retornou sucesso, mas sem ID do pedido. Retorno: ${JSON.stringify(respostaSanitizada)}`);
    }

    orderIds.push(orderId);
    orderResults.push({
      orderId,
      groupKey: grupo.key,
      orderNumber: response?.data?.orderNumber ?? payload.orderNumber,
      shipmentOrderId: response?.data?.shipmentOrderId ?? null,
      orderStatus: response?.data?.orderStatus ?? "CREATED",
      originCountryCode: payload.fromCountryCode,
      logisticName: payload.logisticName,
    });

    const partialUpdate = await atualizarIntegracaoCJ(pedido.id, {
      cj_status: "processing",
      cj_order_id: orderIds[0],
      cj_order_ids: orderResults,
      cj_error: null,
    });

    if (partialUpdate.error) {
      throw new Error(
        `Pedido criado na CJ (${orderId}), mas não foi possível salvar o vínculo local: ${partialUpdate.error.message}`
      );
    }
  }

  if (!orderIds.length) {
    throw new Error("Nenhum item CJ do pedido pôde ser associado ao frete calculado.");
  }

  const update = await atualizarIntegracaoCJ(pedido.id, {
    cj_status: "sent",
    cj_order_id: orderIds[0],
    cj_order_ids: orderResults,
    cj_error: null,
    cj_sent_at: new Date().toISOString(),
  });

  if (update.error) {
    throw new Error(`Pedido enviado à CJ, mas não foi possível salvar o vínculo local: ${update.error.message}`);
  }

  return {
    skipped: false,
    orderIds,
    orders: orderResults,
  };
}
