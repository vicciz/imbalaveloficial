import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";

export function cleanHtml(html: string): string {
  if (!html) return "";

  const limpo = sanitizeHtml(html, {
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

  const $ = cheerio.load(limpo);

  $("img").remove();
  $("style").remove();
  $("script").remove();

  $("*").each((_, el) => {
    $(el).removeAttr("style");
    $(el).removeAttr("class");
    $(el).removeAttr("id");
  });

  return $.html();
}