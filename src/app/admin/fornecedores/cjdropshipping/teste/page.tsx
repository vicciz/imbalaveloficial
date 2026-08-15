"use client";

import { AdminLayout } from "@/src/components/layout/Admin";
import { useState } from "react";

interface PreviewResponse {
  success: boolean;
  message?: string;
  provider?: string;
  externalId?: string;
  raw?: unknown;
  normalized?: unknown;
  diagnostics?: {
    warnings: string[];
    counts: {
      images: number;
      variants: number;
      specifications: number;
    };
  };
}

export default function CJImportDiagnosticPage() {
  const [pid, setPid] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PreviewResponse | null>(null);

  async function executarPreview() {
    const value = pid.trim();
    if (!value) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/products/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "cj", externalId: value }),
      });

      const data = (await response.json()) as PreviewResponse;
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Erro ao executar preview.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Diagnóstico de importação CJ</h1>
          <p className="mt-1 text-slate-500">
            Consulta a API da CJ sem salvar nada no banco. Use um PID real para
            visualizar o JSON bruto e os dados normalizados pelo Imbalável.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={pid}
              onChange={(event) => setPid(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") executarPreview();
              }}
              placeholder="Cole o PID do produto da CJ"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
            <button
              type="button"
              onClick={executarPreview}
              disabled={loading || !pid.trim()}
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Consultando..." : "Consultar produto"}
            </button>
          </div>
        </section>

        {result && !result.success && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {result.message ?? "Não foi possível consultar o produto."}
          </section>
        )}

        {result?.success && (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Metric label="Imagens" value={result.diagnostics?.counts.images ?? 0} />
              <Metric label="Variações" value={result.diagnostics?.counts.variants ?? 0} />
              <Metric
                label="Especificações"
                value={result.diagnostics?.counts.specifications ?? 0}
              />
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-semibold text-amber-900">Avisos</h2>
              {result.diagnostics?.warnings.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-800">
                  {result.diagnostics.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-amber-800">
                  Nenhum aviso encontrado na normalização inicial.
                </p>
              )}
            </section>

            <JsonPanel title="JSON bruto retornado pela CJ" value={result.raw} />
            <JsonPanel title="Produto normalizado pelo Imbalável" value={result.normalized} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function JsonPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
      <div className="border-b border-slate-800 px-5 py-4">
        <h2 className="font-semibold text-white">{title}</h2>
      </div>
      <pre className="max-h-[650px] overflow-auto p-5 text-xs leading-5 text-slate-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}
