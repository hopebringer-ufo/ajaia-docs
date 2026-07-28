const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".txt", ".md"] as const;

export type FileImportError =
  | "unsupported_type"
  | "too_large"
  | "read_failed";

export function validateImportFile(file: File): FileImportError | null {
  const name = file.name.toLowerCase();
  const allowed = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!allowed) {
    return "unsupported_type";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "too_large";
  }
  return null;
}

export function fileImportErrorMessage(code: FileImportError): string {
  switch (code) {
    case "unsupported_type":
      return "Only .txt and .md files are supported.";
    case "too_large":
      return "File must be 5 MB or smaller.";
    case "read_failed":
      return "Could not read the file. Please try again.";
  }
}

export async function readImportFileAsHtml(file: File): Promise<string> {
  const text = await file.text();
  const name = file.name.toLowerCase();
  if (name.endsWith(".md")) {
    return markdownToHtml(text);
  }
  return plainTextToHtml(text);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function plainTextToHtml(text: string): string {
  const paragraphs = text.split(/\n{2,}/);
  if (paragraphs.length === 0) {
    return "<p></p>";
  }
  return paragraphs
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** Minimal Markdown → HTML for common patterns (no external deps). */
export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  const inline = (s: string) =>
    escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>");

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim() === "") {
      closeLists();
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      closeLists();
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }
    const ul = line.match(/^[-*]\s+(.+)$/);
    if (ul) {
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }
    const ol = line.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push("<ol>");
        inOl = true;
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }
    if (line === "---" || line === "***") {
      closeLists();
      out.push("<hr>");
      continue;
    }
    closeLists();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeLists();
  return out.length > 0 ? out.join("") : "<p></p>";
}
