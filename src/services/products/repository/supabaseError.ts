export function supabaseErrorMessage(error: unknown, context: string): string {
  const structuredError =
    typeof error === "object" && error !== null
      ? (error as {
          message?: unknown;
          code?: unknown;
          details?: unknown;
          hint?: unknown;
        })
      : null;
  const message =
    error instanceof Error
      ? error.message
      : typeof structuredError?.message === "string"
        ? structuredError.message
        : undefined;
  const code =
    typeof structuredError?.code === "string"
      ? `code ${structuredError.code}`
      : undefined;
  const details =
    typeof structuredError?.details === "string"
      ? structuredError.details
      : undefined;
  const hint =
    typeof structuredError?.hint === "string"
      ? structuredError.hint
      : undefined;
  const parts = [message, code, details, hint].filter(
    (part): part is string => Boolean(part)
  );

  return `${context}: ${parts.length > 0 ? parts.join(" | ") : "Erro desconhecido"}`;
}