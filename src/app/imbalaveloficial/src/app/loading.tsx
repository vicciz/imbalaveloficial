import { Skeleton } from "@/src/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8" aria-label="Carregando página">
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="mt-4 h-4 w-4/5" />
              <Skeleton className="mt-2 h-4 w-2/5" />
              <Skeleton className="mt-5 h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
