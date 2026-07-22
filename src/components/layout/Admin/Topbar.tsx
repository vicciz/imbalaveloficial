"use client";

import {
  Bell,
  ChevronDown,
} from "lucide-react";

export default function Topbar() {
  return (
    <header
      className="
      flex
      h-16
      items-center
      justify-end
      border-b
      border-slate-200
      bg-white
      px-8
      "
    >
      <div className="flex items-center gap-5">

        {/* Notificações */}

        <button
          className="
          relative
          rounded-xl
          p-2
          transition
          hover:bg-slate-100
          "
        >
          <Bell
            size={20}
            className="text-slate-600"
          />

          <span
            className="
            absolute
            right-2
            top-2
            h-2
            w-2
            rounded-full
            bg-red-500
            "
          />
        </button>

        {/* Usuário */}

        <button
          className="
          flex
          items-center
          gap-3
          rounded-xl
          px-2
          py-1
          transition
          hover:bg-slate-100
          "
        >
          <div
            className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-indigo-600
            font-semibold
            text-white
            "
          >
            V
          </div>

          <div className="text-left">

            <p className="text-sm font-semibold">
              Vinicios
            </p>

            <span className="text-xs text-slate-500">
              Administrador
            </span>

          </div>

          <ChevronDown
            size={16}
            className="text-slate-500"
          />

        </button>

      </div>
    </header>
  );
}