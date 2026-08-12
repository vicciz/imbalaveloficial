"use client";

import sanitizeHtml from "sanitize-html";

type Props = {
  html: string;
  className?: string;
};

const ALLOWED_TAGS = [
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "strong",
  "b",
  "em",
  "h2",
  "h3",
  "h4",
  "blockquote",
] as const;

const BASE_CLASS_NAME = [
  "w-full",
  "max-w-none",
  "text-slate-700",
  "leading-7",
  "[&_p]:my-0",
  "[&_p+p]:mt-4",
  "[&_h2]:mb-4",
  "[&_h2]:mt-8",
  "[&_h2]:text-2xl",
  "[&_h2]:font-semibold",
  "[&_h2]:leading-tight",
  "[&_h2]:text-slate-900",
  "[&_h2:first-child]:mt-0",
  "[&_h3]:mb-3",
  "[&_h3]:mt-7",
  "[&_h3]:text-xl",
  "[&_h3]:font-semibold",
  "[&_h3]:leading-tight",
  "[&_h3]:text-slate-900",
  "[&_h4]:mb-2",
  "[&_h4]:mt-5",
  "[&_h4]:text-lg",
  "[&_h4]:font-semibold",
  "[&_h4]:text-slate-900",
  "[&_ul]:my-4",
  "[&_ul]:space-y-2",
  "[&_ol]:my-4",
  "[&_ol]:space-y-2",
  "[&_li]:pl-1",
  "[&_li]:leading-7",
  "[&_strong]:font-semibold",
  "[&_strong]:text-slate-900",
  "[&_table]:my-5",
  "[&_table]:w-full",
  "[&_table]:overflow-hidden",
  "[&_table]:rounded-xl",
  "[&_table]:border-collapse",
  "[&_thead]:bg-slate-50",
  "[&_th]:border",
  "[&_th]:border-slate-200",
  "[&_th]:px-4",
  "[&_th]:py-3",
  "[&_th]:text-left",
  "[&_th]:text-sm",
  "[&_th]:font-semibold",
  "[&_th]:text-slate-700",
  "[&_td]:border",
  "[&_td]:border-slate-200",
  "[&_td]:px-4",
  "[&_td]:py-3",
  "[&_td]:align-top",
  "[&_td]:break-words",
  "[&_blockquote]:my-5",
  "[&_blockquote]:border-l-4",
  "[&_blockquote]:border-slate-200",
  "[&_blockquote]:pl-4",
  "[&_blockquote]:italic",
  "[&_blockquote]:text-slate-600",
].join(" ");

function normalizePlainText(value: string): string {
  const lines = value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  const headingNames = new Set([
    "visao geral",
    "visão geral",
    "principais beneficios",
    "principais benefícios",
    "caracteristicas",
    "características",
    "especificacoes tecnicas",
    "especificações técnicas",
    "indicacao de uso",
    "indicação de uso",
    "conteudo da embalagem",
    "conteúdo da embalagem",
  ]);

  const output: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    output.push(`<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  for (const line of lines) {
    const normalized = line.toLocaleLowerCase("pt-BR");

    if (headingNames.has(normalized)) {
      flushList();
      output.push(`<h2>${escapeHtml(line)}</h2>`);
      continue;
    }

    const bullet = line.match(/^(?:[-*•]\s+|\d+[.)]\s+)(.+)$/);
    if (bullet) {
      listItems.push(bullet[1]);
      continue;
    }

    flushList();
    output.push(`<p>${escapeHtml(line)}</p>`);
  }

  flushList();
  return output.join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeProductHtml(html: string): string {
  const hasHtml = /<\s*[a-z][^>]*>/i.test(html);
  const source = hasHtml ? html : normalizePlainText(html);

  return sanitizeHtml(source, {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames
    .filter((className): className is string => Boolean(className))
    .join(" ");
}

export default function ProductDescription({ html, className }: Props) {
  const sanitizedHtml = sanitizeProductHtml(html);

  if (!sanitizedHtml.trim()) {
    return null;
  }

  return (
    <div
      className={joinClassNames(BASE_CLASS_NAME, className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
