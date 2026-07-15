"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setLastPurchasePath } from "./purchase-tracking";

export default function NavigationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    setLastPurchasePath(pathname);
  }, [pathname]);

  return null;
}
