import type { Product } from "../../types/Product";
import type { ProductOption } from "../../types/ProductOption";
import type { ProductSpecification } from "../../types/ProductSpecification";
import type { ProductVariant } from "../../types/ProductVariant";

interface CjVariantProperty {
  key?: string;
  name?: string;
  value?: string;
  option?: string;
}

interface CjVariant {
  variantSku?: string;
  vid?: string;
  variantSellPrice?: number | string;
  variantSugSellPrice?: number | string;
  variantLength?: number | string;
  variantWidth?: number | string;
  variantHeight?: number | string;
  variantWeight?: number | string;
  variantBarCode?: string;
  variantBarcode?: string;
  inventoryNum?: number | string;
  variantImage?: string;
  variantProperty?: string;
  variantKey?: string;
  variantUnit?: string;
}

interface CjRawProduct {
  pid?: string;
  productNameEn?: string;
  productName?: string;
  description?: string;
  brandName?: string;
  supplierName?: string;
  categoryName?: string;
  productImageSet?: string[];
  productImage?: string;
  materialNameEnSet?: string[];
  materialNameEn?: string;
  packingNameEnSet?: string[];
  packingNameEn?: string;
  productProEnSet?: string[];
  productProEn?: string;
  entryCode?: string;
  entryNameEn?: string;
  productWeight?: number | string;
  productLength?: number | string;
  productWidth?: number | string;
  productHeight?: number | string;
  packingWeight?: number | string;
  suggestSellPrice?: number | string;
  productSku?: string;
  productType?: string;
  productKeyEn?: string;
  productKeyEnSet?: string[];
  productKey?: string;
  productKeySet?: string[];
  productUnit?: string;
  sourceUrl?: string;
  warehouseId?: string;
  warehouseName?: string;
  countryCode?: string;
  countryName?: string;
  createrTime?: string;
  variants?: CjVariant[];
}

function parseJsonArray<T>(value: string | undefined): T[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function asStringArray(value: string[] | undefined, fallbackJson: string | undefined): string[] {
  if (Array.isArray(value)) {
    return value;
  }

  return parseJsonArray<string>(fallbackJson);
}

function mapVariantOptions(variant: CjVariant, product: CjRawProduct): ProductOption[] {
  const properties = parseJsonArray<CjVariantProperty>(variant.variantProperty);

  if (properties.length > 0) {
    return properties.map((property) => ({
      name: property.key ?? property.name ?? "Modelo",
      value: property.value ?? property.option ?? "",
    }));
  }

  const optionNames =
    product.productKeyEnSet?.filter(Boolean) ??
    asStringArray(undefined, product.productKeyEn);

  const rawKey = (variant.variantKey ?? "Padrão").trim();

  if (optionNames.length <= 1) {
    return [
      {
        name: optionNames[0] ?? "Modelo",
        value: rawKey || "Padrão",
      },
    ];
  }

  const parts = rawKey
    .split("-")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < optionNames.length) {
    return [
      {
        name: optionNames.join(" / "),
        value: rawKey || "Padrão",
      },
    ];
  }

  // A CJ usa hífen como separador, mas alguns valores também contêm hífen.
  // Para o caso mais comum de 2 atributos, o último segmento é o tamanho/opção
  // final e o restante permanece como o primeiro valor (ex.: "White 1-S").
  const values =
    optionNames.length === 2
      ? [parts.slice(0, -1).join("-"), parts[parts.length - 1]]
      : [
          ...parts.slice(0, optionNames.length - 1),
          parts.slice(optionNames.length - 1).join("-"),
        ];

  return optionNames.map((name, index) => ({
    name: name.trim(),
    value: values[index]?.trim() ?? "",
  }));
}

function toNumber(value: number | string | undefined): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pushSpecification(
  list: ProductSpecification[],
  group: string,
  name: string,
  value: string | number | undefined,
  indexRef: { value: number }
): void {
  if (value === undefined || value === "") {
    return;
  }

  list.push({
    group,
    name,
    value: String(value),
    order: indexRef.value,
  });

  indexRef.value += 1;
}

function mapSpecifications(product: CjRawProduct): ProductSpecification[] {
  const material = asStringArray(product.materialNameEnSet, product.materialNameEn);
  const packaging = asStringArray(product.packingNameEnSet, product.packingNameEn);
  const properties = asStringArray(product.productProEnSet, product.productProEn);

  const specifications: ProductSpecification[] = [];
  const order = { value: 0 };

  pushSpecification(specifications, "Categoria", "Categoria CJ", product.categoryName, order);
  pushSpecification(specifications, "Logística", "HS Code", product.entryCode, order);
  pushSpecification(specifications, "Logística", "Descrição Aduaneira", product.entryNameEn, order);
  pushSpecification(specifications, "Dimensões", "Peso", product.productWeight, order);
  pushSpecification(specifications, "Dimensões", "Peso Embalado", product.packingWeight, order);

  for (const item of material) {
    pushSpecification(specifications, "Material", "Material", item, order);
  }

  for (const item of packaging) {
    pushSpecification(specifications, "Embalagem", "Tipo", item, order);
  }

  for (const item of properties) {
    pushSpecification(specifications, "Produto", "Tipo", item, order);
  }

  pushSpecification(specifications, "Produto", "Preço sugerido", product.suggestSellPrice, order);
  pushSpecification(specifications, "Produto", "Criado em", product.createrTime, order);

  return specifications;
}

function mapVariants(variants: CjVariant[] | undefined, product: CjRawProduct): ProductVariant[] {
  return (variants ?? []).map((variant) => ({
    sku: variant.variantSku ?? "",
    externalId: variant.vid ?? "",
    externalSku: variant.variantSku ?? "",
    supplierCost: toNumber(variant.variantSellPrice),
    stock: toNumber(variant.inventoryNum),
    active: true,
    primaryImageUrl: variant.variantImage,
    barcode: variant.variantBarCode ?? variant.variantBarcode,
    unit: variant.variantUnit,
    // A API da CJ retorna peso em gramas e dimensões em milímetros.
    weightKg: toNumber(variant.variantWeight) / 1000 || undefined,
    lengthCm: toNumber(variant.variantLength) / 10 || undefined,
    widthCm: toNumber(variant.variantWidth) / 10 || undefined,
    heightCm: toNumber(variant.variantHeight) / 10 || undefined,
    options: mapVariantOptions(variant, product),
  }));
}

function parseRawProduct(raw: unknown): CjRawProduct {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Produto da CJ inválido");
  }

  return raw as CjRawProduct;
}

export function mapCJProductToProduct(raw: unknown): Product {
  const product = parseRawProduct(raw);
  const images = asStringArray(product.productImageSet, product.productImage);

  return {
    externalId: product.pid ?? "",
    source: "cj",
    platform: {
      key: "cj",
      name: "CJ Dropshipping",
    },
    supplier: {
      name: product.supplierName ?? "CJ Dropshipping",
    },
    brand: {
      name: product.brandName ?? "Sem marca",
    },
    category: {
      name: product.categoryName ?? "Sem categoria",
    },
    title: product.productNameEn ?? product.productName ?? "Produto CJ",
    shortDescription: "",
    description: product.description ?? "",
    seo: {
      title: "",
      description: "",
      slug: "",
      tags: [],
    },
    images: images.map((url, index) => ({
      url,
      order: index,
      isPrimary: index === 0,
    })),
    variants: mapVariants(product.variants, product),
    specifications: mapSpecifications(product),
    markupPercent: 50,
    externalUrl: product.sourceUrl,
    logistics: {
      originCountryCode: product.countryCode,
      originCountryName: product.countryName,
      warehouseId: product.warehouseId,
      warehouseName: product.warehouseName,
      weightKg: toNumber(product.productWeight) || undefined,
      lengthCm: toNumber(product.productLength) || undefined,
      widthCm: toNumber(product.productWidth) || undefined,
      heightCm: toNumber(product.productHeight) || undefined,
    },
  };
}
