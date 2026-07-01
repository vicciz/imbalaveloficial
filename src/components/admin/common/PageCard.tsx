"use client";

import { ReactNode } from "react";
import clsx from "clsx";

interface PageCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export default function PageCard({
  title,
  description,
  children,
  className,
  actions,
}: PageCardProps) {
  return (
    <section
      className={clsx(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      {(title || description || actions) && (
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </header>
      )}

      <div className="p-6">
        {children}
      </div>
    </section>
  );
}