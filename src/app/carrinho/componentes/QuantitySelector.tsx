"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/src/components/ui/button";

type QuantitySelectorProps = {
  value: number;
  loading?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function QuantitySelector({
  value,
  loading = false,
  onDecrease,
  onIncrease,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-slate-300">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={loading}
        onClick={onDecrease}
        className="h-9 w-9 rounded-none"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <span className="w-10 text-center text-sm font-semibold text-slate-900">
        {value}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={loading}
        onClick={onIncrease}
        className="h-9 w-9 rounded-none"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}