"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "./routes";
import { getLastPurchasePath } from "./purchase-tracking";

const DEFAULT_CONTINUE_SHOPPING_ROUTE = ROUTES.home;

export function useNavigation() {
  const router = useRouter();

  const goTo = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  const goHome = useCallback(() => {
    goTo(ROUTES.home);
  }, [goTo]);

  const goProducts = useCallback(() => {
    goTo(ROUTES.products);
  }, [goTo]);

  const goCart = useCallback(() => {
    goTo(ROUTES.cart);
  }, [goTo]);

  const goLogin = useCallback(() => {
    goTo(ROUTES.login);
  }, [goTo]);

  const goAdmin = useCallback(() => {
    goTo(ROUTES.admin);
  }, [goTo]);

  const goProfile = useCallback(() => {
    goTo(ROUTES.profile);
  }, [goTo]);

  const continueShopping = useCallback(() => {
    const lastPath = getLastPurchasePath();

    goTo(lastPath || DEFAULT_CONTINUE_SHOPPING_ROUTE);
  }, [goTo]);

  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    continueShopping();
  }, [continueShopping, router]);

  return {
    goTo,
    goBack,
    goHome,
    goProducts,
    goCart,
    goLogin,
    goAdmin,
    goProfile,
    continueShopping,
  };
}
