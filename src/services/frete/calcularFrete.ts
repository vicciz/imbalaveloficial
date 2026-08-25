import { cjRequest } from "@/src/services/cjdropshipping/client";
import { supabase } from "@/supabaseClient";
import { getUsdBrlRate } from "@/src/services/cambio/usdBrl";

export type FreightQuote = {
  provider: "cj" | "frenet";
  international: boolean;
  originCountryCode: string;
  originCountryName?: string | null;
  serviceCode: string;
  serviceName: string;
  price: number;
  currency: "USD" | "BRL";
  deliveryTime: string | null;
};

function digits(value: string) {
  return String(value ?? "").replace(/\D/g, "");
}

function numberOr(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function getSupplierOriginCep(product: any): Promise<string> {
  if (product?.origem_cep) return digits(product.origem_cep);

  if (!product?.id_fornecedor) {
    return "";
  }

  const { data, error } = await supabase
    .from("fornecedores")
    .select("origem_cep")
    .eq("id", product.id_fornecedor)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível obter o CEP de despacho do fornecedor.");
  }

  return digits(data?.origem_cep ?? "");
}

type CJOrigin = {
  countryCode: string;
  countryName: string | null;
  warehouseId: string | null;
};

const cjOriginCache = new Map<string, { value: CJOrigin; expiresAt: number }>();
const cjOriginPromises = new Map<string, Promise<CJOrigin>>();

async function getCJOrigin(vid: string, _product: any): Promise<CJOrigin> {
  // A origem/warehouse da CJ pertence à variante (VID), não ao produto pai.
  // Nunca reutilizamos a origem persistida no produto para outra variante.
  // O resultado por VID fica em cache por alguns minutos para evitar chamadas repetidas.
  const persistedCountryCode = String(_product?.origem_pais_codigo ?? "")
    .trim()
    .toUpperCase();

  if (persistedCountryCode) {
    return {
      countryCode: persistedCountryCode,
      countryName: _product?.origem_pais_nome ?? null,
      warehouseId: _product?.warehouse_id != null
        ? String(_product.warehouse_id)
        : null,
    };
  }

  const cached = cjOriginCache.get(vid);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const pending = cjOriginPromises.get(vid);
  if (pending) {
    return pending;
  }

  const lookupPromise = (async () => {
    const response = await cjRequest<any>(
      `/product/stock/queryByVid?vid=${encodeURIComponent(vid)}`
    );
    console.log("CJ STOCK RESPONSE:", JSON.stringify(response, null, 2));
    const rows = Array.isArray(response?.data) ? response.data : [];

    const available = rows.filter(
      (row: any) =>
        Number(row?.totalInventoryNum ?? row?.storageNum ?? 0) > 0
    );
    const candidates = available.length ? available : rows;

    const selected =
      candidates.find(
        (row: any) =>
          Number(row?.totalInventoryNum ?? row?.storageNum ?? 0) > 0
      ) ?? candidates[0];

    if (!selected?.countryCode) {
      throw new Error(
        "A CJ não informou um warehouse/origem disponível para esta variante."
      );
    }

    const origin: CJOrigin = {
      countryCode: String(selected.countryCode).toUpperCase(),
      countryName:
        selected.countryNameEn ??
        selected.countryName ??
        selected.areaEn ??
        null,
      warehouseId:
        selected.areaId != null ? String(selected.areaId) : null,
    };

    cjOriginCache.set(vid, {
      value: origin,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    return origin;
  })();

  cjOriginPromises.set(vid, lookupPromise);

  try {
    return await lookupPromise;
  } finally {
    cjOriginPromises.delete(vid);
  }
}


export type FreightCartItemInput = {
  product: any;
  variantId?: string | null;
  variantSku?: string | null;
  destinationCep: string;
  quantity: number;
  productPrice: number;
};

export type FreightCartGroup = {
  key: string;
  provider: "cj" | "frenet";
  international: boolean;
  originCountryCode: string;
  originCountryName?: string | null;
  serviceCode: string;
  serviceName: string;
  price: number;
  currency: "USD" | "BRL";
  deliveryTime: string | null;
  priceBRL: number;
  items: Array<{
    produtoId: number | null;
    produtoNome: string;
    quantidade: number;
    variantId: string | null;
    variantSku: string | null;
  }>;
};

async function quoteCJBatch(params: {
  origin: CJOrigin;
  products: Array<{ vid: string; quantity: number }>;
  destinationCep: string;
}) {
  const requestBody = {
    startCountryCode: params.origin.countryCode,
    endCountryCode: "BR",
    zip: digits(params.destinationCep),
    products: params.products,
  };

  console.log("=== CJ FRETE REQUEST ===");
  console.log(JSON.stringify(requestBody, null, 2));
  console.log("========================");

  const response = await cjRequest<any>("/logistic/freightCalculate", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  const data = Array.isArray(response?.data) ? response.data : [];

  console.log("=== CJ BATCH FREIGHT RESPONSE ===");
  console.log(JSON.stringify(response, null, 2));
  console.log("=================================");

  return data
    .filter((item: any) => {
      const price = Number(
        item?.totalPostageFee ?? item?.logisticPrice ?? item?.postage ?? 0
      );
      return Number.isFinite(price) && price >= 0 && !item?.errorEn && !item?.error;
    })
    .map((item: any, index: number): FreightQuote => ({
      provider: "cj",
      international: params.origin.countryCode !== "BR",
      originCountryCode: params.origin.countryCode,
      originCountryName: params.origin.countryName,
      serviceCode: `CJ-${item?.optionId ?? item?.channelId ?? index}`,
      serviceName:
        item?.logisticName ??
        item?.channel?.enName ??
        item?.option?.enName ??
        "Envio internacional",
      price: Number(
        item?.totalPostageFee ?? item?.logisticPrice ?? item?.postage ?? 0
      ),
      currency: "USD",
      deliveryTime:
        item?.logisticAging ??
        item?.arrivalTime ??
        item?.option?.arrivalTime ??
        null,
    }))
    .sort((a: FreightQuote, b: FreightQuote) => a.price - b.price);
}

async function quoteFrenetBatch(params: {
  originCep: string;
  destinationCep: string;
  items: Array<{
    productPrice: number;
    quantity: number;
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    sku?: string | null;
  }>;
}) {
  const token = process.env.FRENET_API_TOKEN?.trim();
  if (!token) throw new Error("FRENET_API_TOKEN não configurado.");

  const originCep = digits(params.originCep);
  const destinationCep = digits(params.destinationCep);

  if (originCep.length !== 8) {
    throw new Error("O fornecedor deste produto não possui um CEP de despacho válido.");
  }
  if (destinationCep.length !== 8) {
    throw new Error("Informe um CEP de destino válido.");
  }

  const response = await fetch("http://api.frenet.com.br/shipping/quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token,
    },
    body: JSON.stringify({
      SellerCEP: originCep,
      RecipientCEP: destinationCep,
      ShipmentInvoiceValue: Number(
        params.items
          .reduce((sum, item) => sum + item.productPrice * item.quantity, 0)
          .toFixed(2)
      ),
      RecipientCountry: "BR",
      ShippingItemArray: params.items.map((item) => ({
        Height: numberOr(item.heightCm, 2),
        Length: numberOr(item.lengthCm, 16),
        Width: numberOr(item.widthCm, 11),
        Weight: numberOr(item.weightKg, 0.3),
        Quantity: item.quantity,
        SKU: item.sku ?? "PRODUTO",
      })),
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.Message ??
        payload?.message ??
        `Frenet retornou ${response.status}.`
    );
  }

  const services =
    payload?.ShippingSevicesArray ?? payload?.ShippingServicesArray ?? [];

  return (services as any[])
    .map(
      (service: any): FreightQuote => ({
        provider: "frenet",
        international: false,
        originCountryCode: "BR",
        originCountryName: "Brasil",
        serviceCode: String(
          service.ServiceCode ?? service.ServiceCodeName ?? ""
        ),
        serviceName: String(
          service.ServiceDescription ??
            service.ServiceDescriptionName ??
            "Frete"
        ),
        price: Number(
          service.ShippingPrice ??
            service.ShippingPriceWithDiscount ??
            service.Price ??
            0
        ),
        currency: "BRL",
        deliveryTime:
          service.DeliveryTime != null
            ? String(service.DeliveryTime)
            : null,
      })
    )
    .filter(
      (item: FreightQuote) =>
        item.serviceCode &&
        Number.isFinite(item.price) &&
        item.price >= 0
    )
    .sort((a: FreightQuote, b: FreightQuote) => a.price - b.price);
}

export async function calcularFreteCarrinho(
  items: FreightCartItemInput[],
  destinationCep: string,
  usdBrlRate: number
): Promise<{ totalBRL: number; grupos: FreightCartGroup[] }> {
  if (!items.length) {
    return { totalBRL: 0, grupos: [] };
  }

  type Resolved = FreightCartItemInput & {
    provider: "cj" | "frenet";
    origin: CJOrigin | null;
    originCep: string | null;
    vid: string | null;
    produtoId: number | null;
    produtoNome: string;
    fornecedorId: number | null;
  };

  const resolved: Resolved[] = [];

  for (const item of items) {
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const produtoId = Number(item.product?.id);
    const produtoNome = String(item.product?.nome ?? "Produto");

    if (String(item.product?.origem ?? "").toLowerCase() === "cj") {
      const persistedVid = item.variantId ? String(item.variantId) : null;
      const variant = item.product?.produto_variacao?.find(
        (v: any) =>
          String(v.id) === persistedVid ||
          String(v.external_variant_id) === persistedVid ||
          String(v.cj_variant_id) === persistedVid ||
          String(v.sku) === persistedVid
      );

      const vid = String(
        variant?.cj_variant_id ??
          variant?.external_variant_id ??
          persistedVid ??
          ""
      ).trim();

      if (!vid) {
        throw new Error(
          `A variante CJ de ${produtoNome} não possui o ID necessário para calcular o frete.`
        );
      }

      const origin = await getCJOrigin(vid, item.product);

      resolved.push({
        ...item,
        quantity,
        provider: "cj",
        origin,
        originCep: null,
        vid,
        produtoId: Number.isFinite(produtoId) ? produtoId : null,
        produtoNome,
        fornecedorId: Number.isFinite(Number(item.product?.id_fornecedor)) ? Number(item.product?.id_fornecedor) : null,
      });
    } else {
      const originCep = await getSupplierOriginCep(item.product);

      resolved.push({
        ...item,
        quantity,
        provider: "frenet",
        origin: null,
        originCep,
        vid: null,
        produtoId: Number.isFinite(produtoId) ? produtoId : null,
        produtoNome,
        fornecedorId: Number.isFinite(Number(item.product?.id_fornecedor)) ? Number(item.product?.id_fornecedor) : null,
      });
    }
  }

  const grupos = new Map<string, Resolved[]>();

  for (const item of resolved) {
    // Frete é cobrado por remessa/origem, não por item do carrinho.
    // Para CJ, todas as variantes que saem do mesmo warehouse entram na
    // mesma cotação. Para Frenet, mantemos a separação por fornecedor +
    // CEP de despacho para não misturar lojas distintas.
    const key =
      item.provider === "cj"
        ? `cj:${item.origin?.countryCode ?? ""}:${item.origin?.warehouseId ?? ""}`
        : `frenet:${item.fornecedorId ?? ""}:${item.originCep ?? ""}`;

    const grupo = grupos.get(key) ?? [];
    grupo.push(item);
    grupos.set(key, grupo);
  }

  const cotacoes: FreightCartGroup[] = [];

  for (const [key, grupo] of grupos) {
    const first = grupo[0];
    let quotes: FreightQuote[];

    if (first.provider === "cj") {
      // Uma remessa da CJ deve gerar uma única cotação, mesmo quando
      // existem várias variantes/produtos no mesmo warehouse. O provedor
      // recebe cada VID com sua quantidade e devolve o custo total daquela
      // remessa. Nunca somamos um frete por linha do carrinho.
      // Regra comercial do carrinho: o frete é uma cobrança por remessa,
      // e não uma cobrança de frete por unidade. Se o cliente aumentar a
      // quantidade do mesmo item da mesma loja/remessa, não devemos mandar
      // essa quantidade para a cotação como se fossem fretes independentes.
      // Mantemos apenas uma ocorrência de cada variante na cotação do grupo.
      const vids = new Set<string>();

      for (const item of grupo) {
        if (!item.vid) {
          throw new Error(`A variante CJ de ${item.produtoNome} não possui VID.`);
        }
        vids.add(item.vid);
      }

      quotes = await quoteCJBatch({
        origin: first.origin!,
        products: Array.from(vids).map((vid) => ({
          vid,
          quantity: 1,
        })),
        destinationCep,
      });

      console.log("=== CJ FRETE GRUPO ===");
      console.log({
        origem: first.origin,
        destinoCep: digits(destinationCep),
        produtos: Array.from(vids).map((vid) => ({ vid, quantity: 1 })),
        itens: grupo.map((item) => ({
          produtoId: item.produtoId,
          produtoNome: item.produtoNome,
          quantidade: item.quantity,
          variantId: item.variantId,
          variantSku: item.variantSku,
        })),
      });
    } else {
      // Mesma regra para fornecedores nacionais: uma remessa por grupo.
      // Não multiplicamos o frete exibido no carrinho pela quantidade.
      const skus = new Set<string>();
      const itensFrenet = grupo.filter((item) => {
        const sku = item.variantSku ?? `produto:${item.produtoId ?? item.produtoNome}`;
        if (skus.has(sku)) return false;
        skus.add(sku);
        return true;
      });

      quotes = await quoteFrenetBatch({
        originCep: first.originCep ?? "",
        destinationCep,
        items: itensFrenet.map((item) => ({
          productPrice: Number(item.productPrice) || 0,
          quantity: 1,
          weightKg: numberOr(item.product?.peso_kg, 0.3),
          lengthCm: numberOr(item.product?.comprimento_cm, 16),
          widthCm: numberOr(item.product?.largura_cm, 11),
          heightCm: numberOr(item.product?.altura_cm, 2),
          sku: item.variantSku ?? null,
        })),
      });
    }

    if (!quotes.length) {
      throw new Error(
        `Nenhuma modalidade de frete disponível para ${grupo
          .map((item) => item.produtoNome)
          .join(", ")}.`
      );
    }

    const escolhido = quotes[0];
    const priceBRL =
      escolhido.currency === "USD"
        ? Number((escolhido.price * usdBrlRate).toFixed(2))
        : Number(escolhido.price.toFixed(2));

    cotacoes.push({
      key,
      ...escolhido,
      priceBRL,
      items: grupo.map((item) => ({
        produtoId: item.produtoId,
        produtoNome: item.produtoNome,
        quantidade: item.quantity,
        variantId: item.variantId ? String(item.variantId) : null,
        variantSku: item.variantSku ? String(item.variantSku) : null,
      })),
    });
  }

  return {
    totalBRL: Number(
      cotacoes.reduce((sum, quote) => sum + quote.priceBRL, 0).toFixed(2)
    ),
    grupos: cotacoes,
  };
}

async function quoteCJ(params: {
  vid: string;
  quantity: number;
  destinationCep: string;
  product: any;
}) {
  const origin = await getCJOrigin(params.vid, params.product);

  const response = await cjRequest<any>("/logistic/freightCalculate", {
    method: "POST",
    body: JSON.stringify({
      startCountryCode: origin.countryCode,
      endCountryCode: "BR",
      zip: digits(params.destinationCep),
      products: [{ quantity: params.quantity, vid: params.vid }],
    }),
  });

  const data = Array.isArray(response?.data) ? response.data : [];
console.log("=== CJ FREIGHT RESPONSE ===");
console.log(JSON.stringify(response, null, 2));
console.log("===========================");
  return data
    .filter((item: any) => {
      const price = Number(item?.totalPostageFee ?? item?.logisticPrice ?? item?.postage ?? 0);
      return Number.isFinite(price) && price >= 0 && !item?.errorEn && !item?.error;
    })
    .map((item: any, index: number): FreightQuote => ({
      provider: "cj",
      international: origin.countryCode !== "BR",
      originCountryCode: origin.countryCode,
      originCountryName: origin.countryName,
      serviceCode: `CJ-${item?.optionId ?? item?.channelId ?? index}`,
      serviceName:
        item?.logisticName ??
        item?.channel?.enName ??
        item?.option?.enName ??
        "Envio internacional",
      price: Number(item?.totalPostageFee ?? item?.logisticPrice ?? item?.postage ?? 0),
      currency: "USD",
      deliveryTime: item?.logisticAging ?? item?.arrivalTime ?? item?.option?.arrivalTime ?? null,
    }))
    .sort((a: FreightQuote, b: FreightQuote) => a.price - b.price);
}

async function quoteFrenet(params: {
  originCep: string;
  destinationCep: string;
  productPrice: number;
  quantity: number;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  sku?: string | null;
}) {
  const token = process.env.FRENET_API_TOKEN?.trim();
  if (!token) throw new Error("FRENET_API_TOKEN não configurado.");

  const originCep = digits(params.originCep);
  const destinationCep = digits(params.destinationCep);

  if (originCep.length !== 8) {
    throw new Error("O fornecedor deste produto não possui um CEP de despacho válido.");
  }
  if (destinationCep.length !== 8) {
    throw new Error("Informe um CEP de destino válido.");
  }

  const response = await fetch("http://api.frenet.com.br/shipping/quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token,
    },
    body: JSON.stringify({
      SellerCEP: originCep,
      RecipientCEP: destinationCep,
      ShipmentInvoiceValue: Number((params.productPrice * params.quantity).toFixed(2)),
      RecipientCountry: "BR",
      ShippingItemArray: [{
        Height: numberOr(params.heightCm, 2),
        Length: numberOr(params.lengthCm, 16),
        Width: numberOr(params.widthCm, 11),
        Weight: numberOr(params.weightKg, 0.3),
        Quantity: params.quantity,
        SKU: params.sku ?? "PRODUTO",
      }],
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.Message ?? payload?.message ?? `Frenet retornou ${response.status}.`);
  }

  const services = payload?.ShippingSevicesArray ?? payload?.ShippingServicesArray ?? [];

  return (services as any[])
    .map((service: any): FreightQuote => ({
      provider: "frenet",
      international: false,
      originCountryCode: "BR",
      originCountryName: "Brasil",
      serviceCode: String(service.ServiceCode ?? service.ServiceCodeName ?? ""),
      serviceName: String(service.ServiceDescription ?? service.ServiceDescriptionName ?? "Frete"),
      price: Number(service.ShippingPrice ?? service.ShippingPriceWithDiscount ?? service.Price ?? 0),
      currency: "BRL",
      deliveryTime: service.DeliveryTime != null ? String(service.DeliveryTime) : null,
    }))
    .filter((item: FreightQuote) => item.serviceCode && Number.isFinite(item.price) && item.price >= 0)
    .sort((a: FreightQuote, b: FreightQuote) => a.price - b.price);
}

export async function calcularFreteProduto(params: {
  product: any;
  variantId?: string | null;
  variantSku?: string | null;
  destinationCep: string;
  quantity: number;
  productPrice: number;
}) {
  const product = params.product;
  const quantity = Math.max(1, Math.floor(Number(params.quantity) || 1));

  console.log("=== DEBUG FRETE ===");
console.log("variantId recebido:", params.variantId);
console.log("produto origem:", product?.origem);
console.log(
  "variacoes:",
  product?.produto_variacao?.map((v: any) => ({
    id: v.id,
    cj_variant_id: v.cj_variant_id,
    external_variant_id: v.external_variant_id,
    sku: v.sku,
  }))
);
  console.log("==================");
  
  if (String(product?.origem ?? "").toLowerCase() === "cj") {
const variant = product?.produto_variacao?.find(
  (v: any) =>
    String(v.id) === String(params.variantId) ||
    String(v.external_variant_id) === String(params.variantId) ||
    String(v.sku) === String(params.variantId)
);

const vid =
  variant?.cj_variant_id ||
  variant?.external_variant_id ||
  params.variantId;

if (!vid) {
  throw new Error("A variante CJ deste produto não possui o ID necessário para calcular o frete.");
}

return quoteCJ({
  vid: String(vid),
  quantity,
  destinationCep: params.destinationCep,
  product,
});
  }

  const originCep = await getSupplierOriginCep(product);

  return quoteFrenet({
    originCep,
    destinationCep: params.destinationCep,
    productPrice: Number(params.productPrice) || 0,
    quantity,
    weightKg: numberOr(product?.peso_kg, 0.3),
    lengthCm: numberOr(product?.comprimento_cm, 16),
    widthCm: numberOr(product?.largura_cm, 11),
    heightCm: numberOr(product?.altura_cm, 2),
    sku: params.variantSku ?? null,
  });
}
