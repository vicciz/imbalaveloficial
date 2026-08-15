import type { ProductOption } from "./ProductOption";

export interface ProductVariant {
  sku: string;
  externalId: string;
  /** SKU informado pelo fornecedor. */
  externalSku?: string;
  /** Custo informado pelo fornecedor. Nunca é o preço de venda do Imbalável. */
  supplierCost: number;
  stock: number;
  active: boolean;
  primaryImageUrl?: string;
  options: ProductOption[];
  markupPercent?: number;
  barcode?: string;
  unit?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}
