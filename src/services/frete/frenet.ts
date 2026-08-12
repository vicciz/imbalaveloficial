import { supabase } from "../../../supabaseClient";

export type FreteItem = {
  quantity: number;
  weightKg: number;
  lengthCm: number;
  heightCm: number;
  widthCm: number;
  price: number;
  cjVariantId?: string | null;
  sku?: string | null;
};

export type FreteCotacao = {
  serviceCode: string;
  serviceDescription: string;
  price: number;
  deliveryTime: number | null;
  carrier: string | null;
  currency?: "BRL" | "USD";
};

function somenteDigitos(value: string) {
  return value.replace(/\D/g, "");
}

function numeroPositivo(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function cjRequest<T>(path: string, body: unknown): Promise<T> {
  const token = process.env.CJ_ACCESS_TOKEN?.trim() || process.env.CJ_API_TOKEN?.trim();
  if (!token) throw new Error("CJ_ACCESS_TOKEN não configurado.");

  const response = await fetch(`https://developers.cjdropshipping.com/api2.0/v1${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": token,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false || payload?.result === false) {
    throw new Error(payload?.message ?? `CJ retornou ${response.status}.`);
  }

  return payload as T;
}

export async function calcularFreteCJ(params: {
  origemPais: string;
  destinoPais: string;
  destinoCep?: string;
  itens: FreteItem[];
}) {
  const origem = params.origemPais.trim().toUpperCase();
  const destino = params.destinoPais.trim().toUpperCase();

  if (!origem || !destino) throw new Error("Origem e destino são obrigatórios.");

  const produtos = params.itens
    .filter((item) => item.cjVariantId)
    .map((item) => ({
      quantity: Math.max(1, Math.floor(item.quantity)),
      vid: String(item.cjVariantId),
    }));

  if (!produtos.length) {
    throw new Error("A variante CJ deste produto não possui o Variant ID necessário para calcular o frete internacional.");
  }

  type CjResponse = {
    data?: Array<{
      logisticAging?: string;
      logisticPrice?: number;
      logisticName?: string;
      totalPostageFee?: number;
      taxesFee?: number;
      clearanceOperationFee?: number;
    }>;
  };

  const payload = await cjRequest<CjResponse>("/logistic/freightCalculate", {
    startCountryCode: origem,
    endCountryCode: destino,
    zip: somenteDigitos(params.destinoCep ?? ""),
    products: produtos,
  });

  return (payload.data ?? [])
    .map((item, index) => ({
      serviceCode: `CJ-${index + 1}`,
      serviceDescription: item.logisticName ?? "Envio internacional",
      price: Number(item.totalPostageFee ?? item.logisticPrice ?? 0),
      deliveryTime: item.logisticAging ? null : null,
      carrier: item.logisticName ?? "CJ Dropshipping",
      currency: "USD" as const,
    }))
    .filter((item) => Number.isFinite(item.price) && item.price >= 0);
}

export async function calcularFreteFrenet(params: {
  origemCep?: string;
  destinoCep: string;
  itens: FreteItem[];
}) {
  const token = process.env.FRENET_API_TOKEN?.trim();
  const origemCep = somenteDigitos(params.origemCep ?? process.env.FRENET_ORIGIN_CEP ?? "");

  if (!token) throw new Error("FRENET_API_TOKEN não configurado.");
  if (origemCep.length !== 8) throw new Error("CEP de origem não configurado para o envio nacional.");

  const destinoCep = somenteDigitos(params.destinoCep);
  if (destinoCep.length !== 8) throw new Error("CEP de destino inválido.");
  if (!params.itens.length) throw new Error("Nenhum item informado para calcular o frete.");

  const shipmentValue = params.itens.reduce((total, item) => total + item.price * item.quantity, 0);

  const response = await fetch("https://api.frenet.com.br/shipping/quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token,
    },
    body: JSON.stringify({
      SellerCEP: origemCep,
      RecipientCEP: destinoCep,
      ShipmentInvoiceValue: Number(shipmentValue.toFixed(2)),
      RecipientCountry: "BR",
      ShippingItemArray: params.itens.map((item) => ({
        Height: numeroPositivo(item.heightCm, 2),
        Length: numeroPositivo(item.lengthCm, 16),
        Width: numeroPositivo(item.widthCm, 11),
        Weight: numeroPositivo(item.weightKg, 0.3),
        Quantity: Math.max(1, Math.floor(item.quantity)),
        SKU: item.sku ?? "PRODUTO",
      })),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Frenet retornou ${response.status}: ${body.slice(0, 300)}`);
  }

  const payload = await response.json();
  const services = payload?.ShippingSevicesArray ?? payload?.ShippingServicesArray ?? [];

  return (services as any[])
    .map((service) => ({
      serviceCode: String(service.ServiceCode ?? service.ServiceCodeName ?? ""),
      serviceDescription: String(service.ServiceDescription ?? service.ServiceDescriptionName ?? "Frete"),
      price: Number(service.ShippingPrice ?? service.ShippingPriceWithDiscount ?? service.Price ?? 0),
      deliveryTime: service.DeliveryTime !== undefined ? Number(service.DeliveryTime) : null,
      carrier: service.Carrier ?? service.CarrierName ?? null,
      currency: "BRL" as const,
    }))
    .filter((service) => service.serviceCode && Number.isFinite(service.price) && service.price >= 0)
    .sort((a, b) => a.price - b.price) as FreteCotacao[];
}

export async function buscarDimensoesProduto(produtoId: number) {
  const { data, error } = await supabase
    .from("produto")
    .select("id, peso_kg, comprimento_cm, largura_cm, altura_cm")
    .eq("id", produtoId)
    .single();

  if (error) throw error;
  return data;
}
