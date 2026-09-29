export interface CJProduct {
  id: string;

  productNameEn: string;

  sellPrice: string;

  sellPriceBRL?: number;

  bigImage: string;

  supplierName?: string;

  sku?: string;

  // Identificador da variante na CJ
  vid?: string;
  pid?: string;

  // Origem/warehouse da variante
  warehouseId?: string;

  warehouseName?: string;

  countryCode?: string;

  countryName?: string;

    // Dados necessários para calcular o frete

  freightBRL?: number;
  freightDeliveryTime?: string | null;
}