"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  hideThresholdPercent?: number;
  compactThresholdPercent?: number;
}

export function useScrollHeader({
  hideThresholdPercent = 15,
  compactThresholdPercent = 15,
}: Options = {}) {
  const [headerHidden, setHeaderHidden] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const hideThreshold =
      (document.documentElement.scrollHeight * hideThresholdPercent) / 100;
    const compactThreshold =
      (document.documentElement.scrollHeight * compactThresholdPercent) / 100;

    function handleScroll() {
      const current = window.scrollY;
      const delta = current - lastScrollY.current;

      setIsCompact(current > compactThreshold);

      if (delta > 8 && current > hideThreshold) {
        setHeaderHidden(true);
      } else if (delta < -4) {
        setHeaderHidden(false);
      }

      lastScrollY.current = current;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideThresholdPercent, compactThresholdPercent]);

  return { headerHidden, isCompact };
}
