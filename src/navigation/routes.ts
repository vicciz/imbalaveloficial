export const ROUTES = {
  home: "/",
  products: "/",
  cart: "/carrinho",
  login: "/auth/login",
  cadastro: "/auth/cadastro",
  admin: "/admin",
  profile: "/perfil",
  orders: "/pedidos",
  checkoutSingle: "/stripe/checkout",
  checkoutCart: "/stripe/checkout-carrinho",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
