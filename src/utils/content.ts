import { MAX_DOCUMENT_CONTENT_BYTES } from "@/lib/constants";

export function getContentByteSize(content: string): number {
  return new TextEncoder().encode(content).length;
}

export function validateDocumentContentSize(content: string): string | null {
  const size = getContentByteSize(content);
  if (size > MAX_DOCUMENT_CONTENT_BYTES) {
    return `Document content exceeds the ${MAX_DOCUMENT_CONTENT_BYTES / (1024 * 1024)} MB limit.`;
  }
  return null;
}
