"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface SidebarItemProps {
  titulo: string;
  href: string;
  icon: LucideIcon;
}

export default function SidebarItem({
  titulo,
  href,
  icon: Icon,
}: SidebarItemProps) {
  const pathname = usePathname();

  const ativo =
    pathname === href ||
    pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
        ativo
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <Icon size={18} />

      <span>{titulo}</span>
    </Link>
  );
}