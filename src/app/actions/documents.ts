"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  documentContentSchema,
  renameDocumentSchema,
} from "@/lib/validations/document";
import { validateDocumentContentSize } from "@/utils/content";
import type { ActionResult, Document } from "@/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Unauthorized");
  }
  return { supabase, user };
}

function validateContent(content: string): { success: false; error: string } | null {
  const sizeError = validateDocumentContentSize(content);
  if (sizeError) {
    return { success: false, error: sizeError };
  }
  const parsed = documentContentSchema.safeParse(content);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid content",
    };
  }
  return null;
}

export async function createDocumentAction(
  title?: string,
  content?: string,
): Promise<ActionResult<Document>> {
  const html = content ?? "<p></p>";
  const contentError = validateContent(html);
  if (contentError) {
    return contentError;
  }

  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("documents")
      .insert({
        owner_id: user.id,
        title: title?.trim() || "Untitled document",
        content: html,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message ?? "Failed to create document" };
    }

    revalidatePath("/dashboard");
    return { success: true, data };
  } catch {
    return { success: false, error: "You must be signed in to create documents." };
  }
}

export async function renameDocumentAction(
  documentId: string,
  title: string,
): Promise<ActionResult<Document>> {
  const parsed = renameDocumentSchema.safeParse({ title });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid title",
    };
  }

  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("documents")
      .update({ title: parsed.data.title })
      .eq("id", documentId)
      .eq("owner_id", user.id)
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Could not rename document",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/documents/${documentId}`);
    return { success: true, data };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function deleteDocumentAction(
  documentId: string,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId)
      .eq("owner_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function updateDocumentContentAction(
  documentId: string,
  content: string,
): Promise<ActionResult<Document>> {
  const contentError = validateContent(content);
  if (contentError) {
    return contentError;
  }

  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("documents")
      .update({ content })
      .eq("id", documentId)
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Failed to save document",
      };
    }

    return { success: true, data };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function importDocumentAction(
  title: string,
  contentHtml: string,
): Promise<ActionResult<Document>> {
  const safeTitle =
    title.trim().slice(0, 200) || "Imported document";
  return createDocumentAction(safeTitle, contentHtml);
}
