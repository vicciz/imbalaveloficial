import { NextRequest, NextResponse } from "next/server";

import { buscarProdutoPorPid } from "@/src/services/cjdropshipping/products";
import { cjRequest } from "@/src/services/cjdropshipping/client";
import { getUsdBrlRate } from "@/src/services/cambio/usdBrl";

function digits(value: string) {
  return String(value ?? "").replace(/\D/g, "");
}

export async function GET(
  request: NextRequest
) {
  try {
    const pid =
      request.nextUrl.searchParams.get("pid");

    const cep =
      request.nextUrl.searchParams.get("cep");

    if (!pid) {
      return NextResponse.json(
        {
          error: "PID não informado.",
        },
        { status: 400 }
      );
    }

    const destinationCep = digits(cep ?? "");

    if (destinationCep.length !== 8) {
      return NextResponse.json(
        {
          error: "CEP inválido.",
        },
        { status: 400 }
      );
    }

    /*
     * 1. Busca o produto completo na CJ
     */
    const resposta =
      await buscarProdutoPorPid(pid);

    const produto: any =
      resposta?.data;

    if (!produto) {
      return NextResponse.json(
        {
          error:
            "Produto não encontrado na CJ.",
        },
        { status: 404 }
      );
    }

    /*
     * 2. Pegamos as variantes
     */
    const variantes =
      Array.isArray(produto?.variants)
        ? produto.variants
        : [];

    if (!variantes.length) {
      return NextResponse.json(
        {
          error:
            "A CJ não retornou variantes para este produto.",
        },
        { status: 422 }
      );
    }

    /*
     * 3. Procuramos uma variante que tenha estoque/origem
     */
    let varianteSelecionada: any = null;
    let estoqueSelecionado: any = null;

    for (const variante of variantes) {
      const vid =
        String(variante?.vid ?? "").trim();

      if (!vid) {
        continue;
      }

      const estoqueResponse =
        await cjRequest<any>(
          `/product/stock/queryByVid?vid=${encodeURIComponent(
            vid
          )}`
        );

      const estoques =
        Array.isArray(estoqueResponse?.data)
          ? estoqueResponse.data
          : [];

      const estoque =
        estoques.find(
          (item: any) =>
            Number(
              item?.totalInventoryNum ??
              item?.storageNum ??
              0
            ) > 0
        ) ??
        estoques[0];

      if (estoque?.countryCode) {
        varianteSelecionada =
          variante;

        estoqueSelecionado =
          estoque;

        break;
      }
    }

    if (!varianteSelecionada) {
      return NextResponse.json(
        {
          error:
            "Não foi encontrada uma variante disponível.",
        },
        { status: 422 }
      );
    }

    const vid =
      String(
        varianteSelecionada.vid
      );

    const originCountryCode =
      String(
        estoqueSelecionado.countryCode
      ).toUpperCase();

    /*
     * 4. Calcula o frete
     */
    const freightResponse =
      await cjRequest<any>(
        "/logistic/freightCalculate",
        {
          method: "POST",

          body: JSON.stringify({
            startCountryCode:
              originCountryCode,

            endCountryCode:
              "BR",

            zip:
              destinationCep,

            products: [
              {
                vid,
                quantity: 1,
              },
            ],
          }),
        }
      );

    const fretes =
      Array.isArray(freightResponse?.data)
        ? freightResponse.data
        : [];

    const fretesValidos =
      fretes
        .filter((item: any) => {
          const price =
            Number(
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
        .map((item: any) => ({
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

          deliveryTime:
            item?.logisticAging ??
            item?.arrivalTime ??
            item?.option?.arrivalTime ??
            null,
        }))
        .sort(
          (a: any, b: any) =>
            a.price - b.price
        );

    if (!fretesValidos.length) {
      return NextResponse.json(
        {
          error:
            "Nenhum frete disponível para este CEP.",
        },
        { status: 422 }
      );
    }

    /*
     * 5. Cotação atual do dólar
     */
    const usdBrl =
      await getUsdBrlRate();

    const frete =
      fretesValidos[0];

    const freightBRL =
      Number(
        (
          frete.price *
          usdBrl.rate
        ).toFixed(2)
      );

    /*
     * 6. Também convertemos o preço
     * do produto.
     */
    const productPriceUSD =
      Number(
        varianteSelecionada.variantSellPrice ??
        produto.sellPrice ??
        0
      );

    const productPriceBRL =
      Number(
        (
          productPriceUSD *
          usdBrl.rate
        ).toFixed(2)
      );

    return NextResponse.json({
      success: true,

      pid,

      vid,

      origin: {
        countryCode:
          originCountryCode,

        countryName:
          estoqueSelecionado.countryNameEn ??
          estoqueSelecionado.countryName ??
          estoqueSelecionado.areaEn ??
          null,
      },

      price: {
        usd: productPriceUSD,
        brl: productPriceBRL,
      },

      freight: {
        usd: frete.price,
        brl: freightBRL,
        serviceName:
          frete.serviceName,
        deliveryTime:
          frete.deliveryTime,
      },

      usdBrl: {
        rate: usdBrl.rate,

        source:
          usdBrl.source,

        updatedAt:
          usdBrl.timestamp
            ? new Date(
                usdBrl.timestamp * 1000
              ).toISOString()
            : new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(
      "Erro ao calcular frete CJ:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao calcular frete.",
      },
      { status: 500 }
    );
  }
}