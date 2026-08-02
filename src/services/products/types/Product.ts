import type { ProductImage } from "./ProductImage";
import type { ProductSEO } from "./ProductSEO";
import type { ProductSpecification } from "./ProductSpecification";
import type { ProductVariant } from "./ProductVariant";

export interface ProductSupplier {
  id?: number;
  name: string;
}

export interface ProductBrand {
  id?: number;
  name: string;
}

export interface ProductCategory {
  id?: number;
  name: string;
}

export interface Product {
  id?: number;
  externalId: string;
  source: string;
  supplier: ProductSupplier;
  brand: ProductBrand;
  category: ProductCategory;
  title: string;
  shortDescription: string;
  description: string;
  bullets?: string[];
  seo: ProductSEO;
  images: ProductImage[];
  variants: ProductVariant[];
  specifications: ProductSpecification[];
}
