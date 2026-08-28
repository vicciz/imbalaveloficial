import { cjRequest } from "./client";

/**
 * A API atual da CJ consulta rastreamento pelo número de rastreio.
 * O endpoint antigo /shopping/order/getTrackInfo está deprecated.
 */
export async function buscarTracking(trackNumber: string) {
  const tracking = String(trackNumber ?? "").trim();

  if (!tracking) {
    return null;
  }

  return cjRequest(
    `/logistic/trackInfo?trackNumber=${encodeURIComponent(tracking)}`
  );
}

export async function buscarTrackingPedido(trackNumber: string) {
  return buscarTracking(trackNumber);
}
