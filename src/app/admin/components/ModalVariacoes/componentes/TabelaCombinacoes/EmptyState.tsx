"use client";

export default function EmptyState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed">

      <div className="mb-3 text-5xl">
        📦
      </div>

      <h3 className="text-lg font-semibold">
        Nenhuma combinação encontrada
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        Gere as combinações na aba de atributos.
      </p>

    </div>
  );
}