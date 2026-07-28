"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { shareDocumentSchema } from "@/lib/validations/document";
import { userOwnsDocument } from "@/services/documents";
import type { ActionResult } from "@/types";

export async function shareDocumentAction(
  documentId: string,
  email: string,
): Promise<ActionResult> {
  const parsed = shareDocumentSchema.safeParse({ email });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid email",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to share documents." };
  }

  const owns = await userOwnsDocument(user.id, documentId);
  if (!owns) {
    return { success: false, error: "Only the document owner can share it." };
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  if (normalizedEmail === user.email?.toLowerCase()) {
    return { success: false, error: "You cannot share a document with yourself." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  if (!profile) {
    return {
      success: false,
      error: "No registered user found with that email address.",
    };
  }

  const { error: shareError } = await supabase.from("document_shares").insert({
    document_id: documentId,
    shared_with_user_id: profile.id,
  });

  if (shareError) {
    if (shareError.code === "23505") {
      return { success: false, error: "This document is already shared with that user." };
    }
    return { success: false, error: shareError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/documents/${documentId}`);
  return { success: true, data: undefined };
}
