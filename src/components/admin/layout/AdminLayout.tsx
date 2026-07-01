"use client";

import { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <main
          className="
            flex-1
            overflow-y-auto
            p-8
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}