"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useScrollHeader } from "./useScrollHeader";

export function useHeaderScroll() {
  const pathname = usePathname();

  const { headerHidden, isCompact } = useScrollHeader({
    hideThresholdPercent: 15,
    compactThresholdPercent: 15,
  });

  const [showHeader, setShowHeader] = useState(true);
  const [hasProdutoHero, setHasProdutoHero] = useState(false);

  const isProdutoPage = pathname?.startsWith("/produto");

  useEffect(() => {
    if (!isProdutoPage) {
      setHasProdutoHero(false);
      setShowHeader(true);
      return;
    }

    const hero = document.getElementById("produto-hero");

    if (!hero) {
      setHasProdutoHero(false);
      setShowHeader(true);
      return;
    }

    setHasProdutoHero(true);
    setShowHeader(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowHeader(entry.isIntersecting);
      },
      {
        threshold: 0,
      }
    );

    observer.observe(hero);

    return () => observer.disconnect();
  }, [isProdutoPage]);

  return {
    headerHidden,
    isCompact,
    showHeader,
    hasProdutoHero,
    isHeaderVisible: showHeader && (!headerHidden),
  };
}