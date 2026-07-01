"use client";

import Link from "next/link";

import {
  adminMenu,
  adminMenuBottom,
} from "@/src/constants/adminMenu";

import SidebarItem from "./SidebarItem";

export default function Sidebar() {
  return (
    <aside
      className="
      flex
      h-screen
      w-72
      flex-col
      border-r
      border-slate-200
      bg-white
      "
    >
      {/* Logo */}

      <div
        className="
        flex
        h-20
        items-center
        border-b
        border-slate-200
        px-6
        "
      >
        <Link
          href="/admin"
          className="
          text-2xl
          font-bold
          tracking-wide
          text-indigo-600
          "
        >
          IMBALÁVEL
        </Link>
      </div>

      {/* Menu */}

      <nav
        className="
        flex-1
        overflow-y-auto
        p-4
        "
      >
        <div className="space-y-2">

          {adminMenu.map((item) => (

            <SidebarItem
              key={item.href}
              {...item}
            />

          ))}

        </div>
      </nav>

      {/* Rodapé */}

      <div
        className="
        border-t
        border-slate-200
        p-4
        "
      >
        <div className="space-y-2">

          {adminMenuBottom.map((item) => (

            <SidebarItem
              key={item.href}
              {...item}
            />

          ))}

        </div>
      </div>
    </aside>
  );
}