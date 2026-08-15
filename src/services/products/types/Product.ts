import type { ProductImage } from "./ProductImage";
import type { ProductSEO } from "./ProductSEO";
import type { ProductSpecification } from "./ProductSpecification";
import type { ProductVariant } from "./ProductVariant";

export interface ProductSupplier {
  id?: number;
  name: string;
  externalId?: string;
}

export interface ProductPlatform {
  id?: number;
  key: string;
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
  platform?: ProductPlatform;
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
  markupPercent?: number;
  externalUrl?: string;
  logistics?: ProductLogistics;
}

export interface ProductLogistics {
  originCountryCode?: string;
  originCountryName?: string;
  warehouseId?: string;
  warehouseName?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  originCep?: string;
}
