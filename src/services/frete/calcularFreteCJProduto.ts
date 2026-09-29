import { cjRequest } from "@/src/services/cjdropshipping/client";
import { getUsdBrlRate } from "@/src/services/cambio/usdBrl";

export type CJProductFreightQuote = {
  priceUSD: number;
  priceBRL: number;
  serviceName: string;
  deliveryTime: string | null;
  originCountryCode: string;
};

function digits(value: string) {
  return String(value ?? "").replace(/\D/g, "");
}

export async function calcularFreteCJProdutoNaoImportado(params: {
  vid: string;
  destinationCep: string;
  quantity?: number;
  originCountryCode?: string;
}) {
  const quantity = Math.max(
    1,
    Math.floor(Number(params.quantity ?? 1))
  );

  const destinationCep = digits(params.destinationCep);

  if (destinationCep.length !== 8) {
    throw new Error("CEP de destino inválido.");
  }

  if (!params.vid) {
    throw new Error("VID da variante CJ não informado.");
  }

  /*
   * Se a origem não for conhecida, usamos US como fallback.
   * Depois podemos pegar o warehouse real da CJ pelo VID.
   */
  const startCountryCode =
    params.originCountryCode?.trim().toUpperCase() || "US";

  const response = await cjRequest<any>(
    "/logistic/freightCalculate",
    {
      method: "POST",
      body: JSON.stringify({
        startCountryCode,
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

  console.log("=== CJ FRETE PRODUTO NÃO IMPORTADO ===");
  console.log(
    JSON.stringify(response, null, 2)
  );
  console.log("======================================");

  const data = Array.isArray(response?.data)
    ? response.data
    : [];

  const quotes = data
    .filter((item: any) => {
      const price = Number(
        item?.totalPostageFee ??
        item?.logisticPrice ??
        item?.postage ??
        0
      );

      return (
        Number.isFinite(price) &&
        price >= 0 &&
        !item?.errorEn &&
        !item?.error
      );
    })
    .map((item: any): CJProductFreightQuote => ({
      priceUSD: Number(
        item?.totalPostageFee ??
        item?.logisticPrice ??
        item?.postage ??
        0
      ),

      priceBRL: 0,

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

      originCountryCode: startCountryCode,
    }))
    .sort(
      (a, b) => a.priceUSD - b.priceUSD
    );

  if (!quotes.length) {
    throw new Error(
      "A CJ não encontrou modalidade de frete para este produto."
    );
  }

  const usdBrl = await getUsdBrlRate();

  const quotesWithBRL = quotes.map(
    (quote) => ({
      ...quote,
      priceBRL: Number(
        (quote.priceUSD * usdBrl.rate).toFixed(2)
      ),
    })
  );

  return {
    selected: quotesWithBRL[0],
    quotes: quotesWithBRL,

    usdBrl: {
      rate: usdBrl.rate,
      source: usdBrl.source,
      updatedAt: usdBrl.timestamp
        ? new Date(
            usdBrl.timestamp * 1000
          ).toISOString()
        : new Date().toISOString(),
    },
  };
}