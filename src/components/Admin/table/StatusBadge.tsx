"use client";

import clsx from "clsx";

export type StatusType =
  | "ativo"
  | "oculto"
  | "pendente"
  | "pago"
  | "cancelado"
  | "rascunho";

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig = {
  ativo: {
    label: "Ativo",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
  },

  oculto: {
    label: "Oculto",
    className:
      "bg-slate-100 text-slate-700 border-slate-200",
  },

  pendente: {
    label: "Pendente",
    className:
      "bg-amber-100 text-amber-700 border-amber-200",
  },

  pago: {
    label: "Pago",
    className:
      "bg-sky-100 text-sky-700 border-sky-200",
  },

  cancelado: {
    label: "Cancelado",
    className:
      "bg-red-100 text-red-700 border-red-200",
  },

  rascunho: {
    label: "Rascunho",
    className:
      "bg-violet-100 text-violet-700 border-violet-200",
  },
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}