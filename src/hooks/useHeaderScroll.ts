"use client";

import { useScrollHeader } from "@/src/hooks/useScrollHeader";

export function useHeaderScroll() {
  const { headerHidden, isCompact } = useScrollHeader({
    hideThresholdPercent: 15,
    compactThresholdPercent: 15,
  });

  return {
    headerHidden,
    isCompact,
  };
}