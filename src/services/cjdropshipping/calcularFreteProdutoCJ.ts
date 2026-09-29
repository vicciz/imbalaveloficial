import { cjRequest } from "@/src/services/cjdropshipping/client";
import { getUsdBrlRate } from "@/src/services/cambio/usdBrl";

function digits(value: string) {
  return String(value ?? "").replace(/\D/g, "");
}

export type CJProductFreight = {
  priceUSD: number;
  priceBRL: number;
  serviceName: string;
  deliveryTime: string | null;
  originCountryCode: string;
};

export async function calcularFreteProdutoCJ(params: {
  vid: string;
  quantity?: number;
  destinationCep: string;
  originCountryCode?: string;
}): Promise<CJProductFreight[]> {
  const quantity = Math.max(
    1,
    Math.floor(Number(params.quantity) || 1)
  );

  const destinationCep = digits(params.destinationCep);

  if (destinationCep.length !== 8) {
    throw new Error("CEP de destino inválido.");
  }

  const originCountryCode =
    params.originCountryCode?.trim().toUpperCase() || "CN";

  if (!params.vid) {
    throw new Error("VID da variante CJ não informado.");
  }

  const response = await cjRequest<any>(
    "/logistic/freightCalculate",
    {
      method: "POST",
      body: JSON.stringify({
        startCountryCode: originCountryCode,
        endCountryCode: "BR",
        zip: destinationCep,
        products: [
          {
            vid: params.vid,
            quantity,
          },
        ],
      }),
    }
  );

  console.log(
    "=== CJ FRETE PRODUTO NÃO IMPORTADO ==="
  );
  console.log(
    JSON.stringify(response, null, 2)
  );

  const data = Array.isArray(response?.data)
    ? response.data
    : [];

  const usdBrl = await getUsdBrlRate();

  return data
    .map((item: any): CJProductFreight | null => {
      const priceUSD = Number(
        item?.totalPostageFee ??
        item?.logisticPrice ??
        item?.postage ??
        0
      );

      if (
        !Number.isFinite(priceUSD) ||
        priceUSD < 0 ||
        item?.error ||
        item?.errorEn
      ) {
        return null;
      }

      return {
        priceUSD,
        priceBRL: Number(
          (priceUSD * usdBrl.rate).toFixed(2)
        ),
        serviceName:
          item?.logisticName ??
          item?.channel?.enName ??
          item?.option?.enName ??
          "Envio internacional",
        deliveryTime:
          item?.logisticAging ??
          item?.arrivalTime ??
          item?.option?.arrivalTime ??
          null,
        originCountryCode,
      };
    })
    .filter(
      (
        item
      ): item is CJProductFreight =>
        item !== null
    )
    .sort(
      (a, b) =>
        a.priceBRL - b.priceBRL
    );
}