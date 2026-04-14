import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "blockquote", "code", "pre",
  "ul", "ol", "li", "a", "img", "span", "div", "h1", "h2", "h3", "h4",
  "hr", "table", "thead", "tbody", "tr", "th", "td",
];

const ALLOWED_ATTR = ["href", "src", "alt", "title", "target", "rel", "class", "style"];

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?:|\/api\/uploads\/|\/)/i,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });
}

export function htmlTextLength(html: string): number {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim().length;
}
