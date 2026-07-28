import { createClient } from "@/lib/supabase/server";
import type { DocumentWithOwner } from "@/types";

export async function getMyDocuments(userId: string): Promise<DocumentWithOwner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      *,
      owner:profiles!documents_owner_id_fkey (id, email, full_name)
    `,
    )
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DocumentWithOwner[];
}

export async function getSharedDocuments(
  userId: string,
): Promise<DocumentWithOwner[]> {
  const supabase = await createClient();
  const { data: shares, error: shareError } = await supabase
    .from("document_shares")
    .select("document_id")
    .eq("shared_with_user_id", userId);

  if (shareError) {
    throw new Error(shareError.message);
  }

  const ids = (shares ?? []).map((s) => s.document_id);
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      *,
      owner:profiles!documents_owner_id_fkey (id, email, full_name)
    `,
    )
    .in("id", ids)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DocumentWithOwner[];
}

export async function getDocumentById(
  documentId: string,
): Promise<DocumentWithOwner | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      *,
      owner:profiles!documents_owner_id_fkey (id, email, full_name)
    `,
    )
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as DocumentWithOwner | null) ?? null;
}

export async function userOwnsDocument(
  userId: string,
  documentId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id")
    .eq("id", documentId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    return false;
  }
  return Boolean(data);
}
