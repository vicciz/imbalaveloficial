import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";

export function cleanHtml(html: string): string {
  if (!html.trim()) {
    return "";
  }

  const sanitized = sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "strong",
      "b",
      "table",
      "tr",
      "td",
      "tbody",
      "thead",
      "h1",
      "h2",
      "h3",
    ],
    allowedAttributes: {},
  });

  const $ = cheerio.load(sanitized);

  $("img,style,script").remove();
  $("*").each((_, element) => {
    $(element).removeAttr("style");
    $(element).removeAttr("class");
    $(element).removeAttr("id");
  });

  return $.html();
}
