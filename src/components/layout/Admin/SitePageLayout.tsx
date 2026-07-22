"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface SitePageLayoutProps {
  children: ReactNode;
}

export default function SitePageLayout({
  children,
}: SitePageLayoutProps) {
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith("/admin");
  const isHome = pathname === "/";

  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Home sem container
  if (isHome) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-slate-50 text-zinc-900">
        {children}
      </div>
    );
  }

  // Demais páginas continuam centralizadas
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 text-zinc-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col bg-white px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}