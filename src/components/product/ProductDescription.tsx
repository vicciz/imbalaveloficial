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
  "strong",
  "b",
  "em",
  "h2",
  "h3",
  "h4",
  "blockquote",
] as const;

const BASE_CLASS_NAME = [
  "prose",
  "max-w-none",
  "text-slate-700",
  "prose-p:leading-8",
  "prose-p:text-inherit",
  "prose-headings:text-slate-900",
  "prose-headings:font-semibold",
  "prose-h2:mt-0",
  "prose-h3:mt-8",
  "prose-h4:mt-6",
  "prose-ul:my-4",
  "prose-ol:my-4",
  "prose-li:marker:text-slate-500",
  "prose-strong:text-slate-900",
  "prose-blockquote:border-slate-300",
  "prose-blockquote:text-slate-600",
  "prose-table:w-full",
  "prose-table:border-collapse",
  "prose-thead:border-b",
  "prose-tr:border-b",
  "prose-td:border",
  "prose-td:border-slate-200",
  "prose-td:px-3",
  "prose-td:py-2",
].join(" ");

function sanitizeProductHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter((className): className is string => Boolean(className)).join(" ");
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
