import { cjRequest } from "@/src/services/cjdropshipping/client";
import { buscarProdutoPorPid } from "@/src/services/cjdropshipping/products";
import type { FreightQuote } from "./calcularFrete";

function digits(value: string) {
  return String(value ?? "").replace(/\D/g, "");
}

type CjVariant = {
  vid?: string;
  variantSku?: string;
  variantSellPrice?: number | string;
  inventoryNum?: number | string;
};

type CjProductDetail = {
  pid?: string;
  variants?: CjVariant[];
};

type CjStock = {
  countryCode?: string;
  countryNameEn?: string;
  countryName?: string;
  areaEn?: string;
  areaId?: string | number;
  totalInventoryNum?: number | string;
  storageNum?: number | string;
};

export async function calcularFreteProdutoNaoImportado(params: {
  pid: string;
  destinationCep: string;
}) {
  const pid = String(params.pid).trim();
  const destinationCep = digits(params.destinationCep);

  if (!pid) {
    throw new Error("PID do produto não informado.");
  }

  if (destinationCep.length !== 8) {
    throw new Error("CEP de destino inválido.");
  }

  /*
   * 1. Busca os detalhes completos do produto na CJ.
   * Aqui conseguimos os VIDs das variantes.
   */
  const response = await buscarProdutoPorPid(pid);

  const product = response?.data as CjProductDetail | null;

  if (!product) {
    throw new Error("Produto não encontrado na CJ.");
  }

  const variants = Array.isArray(product.variants)
    ? product.variants
    : [];

  if (!variants.length) {
    throw new Error("A CJ não retornou variantes para este produto.");
  }

  /*
   * 2. Procura uma variante com estoque.
   */
  let selectedVariant: CjVariant | null = null;
  let selectedStock: CjStock | null = null;

  for (const variant of variants) {
    const vid = String(variant.vid ?? "").trim();

    if (!vid) continue;

    const stockResponse = await cjRequest<any>(
      `/product/stock/queryByVid?vid=${encodeURIComponent(vid)}`
    );

    const stocks: CjStock[] = Array.isArray(stockResponse?.data)
      ? stockResponse.data
      : [];

    const availableStock =
      stocks.find(
        (stock) =>
          Number(
            stock.totalInventoryNum ??
              stock.storageNum ??
              0
          ) > 0
      ) ?? stocks[0];

    if (availableStock?.countryCode) {
      selectedVariant = variant;
      selectedStock = availableStock;
      break;
    }
  }

  if (!selectedVariant) {
    throw new Error(
      "Não foi encontrada nenhuma variante disponível para este produto."
    );
  }

  const vid = String(selectedVariant.vid);

  /*
   * 3. Origem do produto.
   */
  const originCountryCode = String(
    selectedStock?.countryCode ?? ""
  ).toUpperCase();

  if (!originCountryCode) {
    throw new Error(
      "A CJ não informou a origem do produto."
    );
  }

  /*
   * 4. Calcula o frete.
   */
  const freightResponse = await cjRequest<any>(
    "/logistic/freightCalculate",
    {
      method: "POST",
      body: JSON.stringify({
        startCountryCode: originCountryCode,
        endCountryCode: "BR",
        zip: destinationCep,
        products: [
          {
            vid,
            quantity: 1,
          },
        ],
      }),
    }
  );

  const data = Array.isArray(freightResponse?.data)
    ? freightResponse.data
    : [];

  const quotes: FreightQuote[] = data
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
    .map(
      (item: any, index: number): FreightQuote => ({
        provider: "cj",

        international:
          originCountryCode !== "BR",

        originCountryCode,

        originCountryName:
          selectedStock?.countryNameEn ??
          selectedStock?.countryName ??
          selectedStock?.areaEn ??
          null,

        serviceCode:
          `CJ-${
            item?.optionId ??
            item?.channelId ??
            index
          }`,

        serviceName:
          item?.logisticName ??
          item?.channel?.enName ??
          item?.option?.enName ??
          "Envio internacional",

        price: Number(
          item?.totalPostageFee ??
            item?.logisticPrice ??
            item?.postage ??
            0
        ),

        currency: "USD",

        deliveryTime:
          item?.logisticAging ??
          item?.arrivalTime ??
          item?.option?.arrivalTime ??
          null,
      })
    )
    .sort((a, b) => a.price - b.price);

  if (!quotes.length) {
    throw new Error(
      "Nenhuma modalidade de frete disponível."
    );
  }

  return {
    vid,
    origin: {
      countryCode: originCountryCode,
      countryName:
        selectedStock?.countryNameEn ??
        selectedStock?.countryName ??
        selectedStock?.areaEn ??
        null,
    },
    quote: quotes[0],
    quotes,
  };
}