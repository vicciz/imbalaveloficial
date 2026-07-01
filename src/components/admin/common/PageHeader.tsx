"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
  titulo: string;
  descricao?: string;
  children?: ReactNode;
}

export default function PageHeader({
  titulo,
  descricao,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {titulo}
        </h1>

        {descricao && (
          <p className="mt-2 text-sm text-slate-500">
            {descricao}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}