import { cjRequest } from "./client";

export async function buscarTracking(
  orderId: string
) {
  return cjRequest(
    `/shopping/order/getTrackInfo?orderId=${orderId}`
  );
}