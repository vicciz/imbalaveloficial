import { Skeleton } from "@/src/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto w-full max-w-[100rem] px-4 py-8 sm:px-6 lg:px-8" aria-label="Carregando produto">
      <div className="grid grid-cols-1 gap-10 xl:grid-cols-8">
        <section className="xl:col-span-4">
          <Skeleton className="mx-auto aspect-square w-full max-w-[34rem]" />
          <div className="mt-4 flex justify-center gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="size-16" />
            ))}
          </div>
        </section>
        <section className="space-y-6 xl:col-span-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-10 w-44" />
          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-16 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </section>
      </div>
    </div>
  );
}
