"use client";

import { ImageUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BannerUploadProps {
  onClick: () => void;
}

export default function BannerUpload({
  onClick,
}: BannerUploadProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-2xl border border-dashed",
        "border-zinc-300 bg-white p-8",
        "transition hover:border-violet-500 hover:bg-violet-50"
      )}
    >
      <div className="flex flex-col items-center justify-center">

        <div
          className={cn(
            "mb-4 rounded-xl border",
            "border-zinc-300 bg-zinc-100",
            "p-4 transition",
            "group-hover:border-violet-500",
            "group-hover:bg-violet-100"
          )}
        >
          <ImageUp
            size={42}
            className="text-zinc-500 group-hover:text-violet-600"
          />
        </div>

        <p className="text-sm font-medium text-zinc-700">
          Arraste ou selecione uma imagem
        </p>

        <p className="mt-3 text-xs text-zinc-400">
          Atenção: banners devem conter resolução de 1920 × 500
        </p>

      </div>
    </button>
  );
}