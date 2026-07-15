const LAST_PURCHASE_PAGE_KEY = "navigation:lastPurchasePage";

const IGNORED_PREFIXES = [
  "/carrinho",
  "/stripe",
  "/auth/login",
  "/auth/cadastro",
  "/admin",
  "/perfil",
  "/pedidos",
  "/sucesso",
  "/cancelado",
];

export function shouldTrackPurchasePath(pathname: string) {
  if (!pathname) return false;

  if (IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  return pathname === "/" || pathname.startsWith("/produto");
}

export function setLastPurchasePath(pathname: string) {
  if (typeof window === "undefined") return;

  if (!shouldTrackPurchasePath(pathname)) return;

  window.sessionStorage.setItem(LAST_PURCHASE_PAGE_KEY, pathname);
}

export function getLastPurchasePath() {
  if (typeof window === "undefined") return null;

  return window.sessionStorage.getItem(LAST_PURCHASE_PAGE_KEY);
}

export { LAST_PURCHASE_PAGE_KEY };
