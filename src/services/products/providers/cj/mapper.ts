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
  inventoryNum?: number | string;
  variantImage?: string;
  variantProperty?: string;
  variantKey?: string;
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
  packingWeight?: number | string;
  suggestSellPrice?: number | string;
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

function mapVariantOptions(variant: CjVariant): ProductOption[] {
  const properties = parseJsonArray<CjVariantProperty>(variant.variantProperty);

  if (properties.length > 0) {
    return properties.map((property) => ({
      name: property.key ?? property.name ?? "Modelo",
      value: property.value ?? property.option ?? "",
    }));
  }

  return [
    {
      name: "Modelo",
      value: variant.variantKey ?? "Padrão",
    },
  ];
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

function mapVariants(variants: CjVariant[] | undefined): ProductVariant[] {
  return (variants ?? []).map((variant) => ({
    sku: variant.variantSku ?? "",
    externalId: variant.vid ?? "",
    price: toNumber(variant.variantSellPrice),
    stock: toNumber(variant.inventoryNum),
    active: true,
    primaryImageUrl: variant.variantImage,
    options: mapVariantOptions(variant),
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
    variants: mapVariants(product.variants),
    specifications: mapSpecifications(product),
  };
}
