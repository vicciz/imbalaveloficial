"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useNavigation } from "@/src/navigation";

type BackButtonProps = {
  label?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  destination?: string;
  className?: string;
};

export default function BackButton({
  label = "Voltar",
  variant = "ghost",
  destination,
  className,
}: BackButtonProps) {
  const { continueShopping, goTo } = useNavigation();

  function handleClick() {
    if (destination) {
      goTo(destination);
      return;
    }

    continueShopping();
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleClick}
      className={`h-10 justify-start gap-2 px-3 text-sm font-semibold ${className ?? ""}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}
