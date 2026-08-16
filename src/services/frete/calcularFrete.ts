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

async function getCJOrigin(vid: string, product: any): Promise<CJOrigin> {
  const persistedCode = String(product?.origem_pais_codigo ?? "").trim().toUpperCase();
  console.log("CJ ORIGIN PERSISTED CODE:", persistedCode);
  if (persistedCode) {
    return {
      countryCode: persistedCode,
      countryName: product?.origem_pais_nome ?? null,
      warehouseId: product?.warehouse_id != null ? String(product.warehouse_id) : null,
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

    if (product?.id && origin.countryCode) {
      try {
        await supabase
          .from("produto")
          .update({
            origem_pais_codigo: origin.countryCode,
            origem_pais_nome: origin.countryName,
            warehouse_id: origin.warehouseId,
          })
          .eq("id", product.id);
      } catch {
        // Persisting origin is an optimization and must not block checkout.
      }
    }

    return origin;
  })();

  cjOriginPromises.set(vid, lookupPromise);

  try {
    return await lookupPromise;
  } finally {
    cjOriginPromises.delete(vid);
  }
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
