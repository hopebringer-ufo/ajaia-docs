import { z } from "zod";

import { MAX_DOCUMENT_CONTENT_BYTES } from "@/lib/constants";
import { getContentByteSize } from "@/utils/content";

export const documentContentSchema = z
  .string()
  .refine(
    (value) => getContentByteSize(value) <= MAX_DOCUMENT_CONTENT_BYTES,
    `Content must be ${MAX_DOCUMENT_CONTENT_BYTES / (1024 * 1024)} MB or smaller`,
  );

export const renameDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
});

export const shareDocumentSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type RenameDocumentInput = z.infer<typeof renameDocumentSchema>;
export type ShareDocumentInput = z.infer<typeof shareDocumentSchema>;
