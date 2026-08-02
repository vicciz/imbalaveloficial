import type { ProductOption } from "./ProductOption";

export interface ProductVariant {
  sku: string;
  externalId: string;
  price: number;
  stock: number;
  active: boolean;
  primaryImageUrl?: string;
  options: ProductOption[];
}
