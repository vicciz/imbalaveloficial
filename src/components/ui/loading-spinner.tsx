import { LoaderCircle } from "lucide-react";

import { cn } from "@/src/lib/utils";

type LoadingSpinnerProps = {
  className?: string;
  label?: string;
};

function LoadingSpinner({
  className,
  label = "Carregando",
}: LoadingSpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center">
      <LoaderCircle aria-hidden="true" className={cn("size-4 animate-spin", className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { LoadingSpinner };
