import { createClient } from "@/lib/supabase/server";
import type { DocumentWithOwner, Profile } from "@/types";

type DocumentRow = {
  id: string;
  owner_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

function stubOwner(id: string): Pick<Profile, "id" | "email" | "full_name"> {
  return { id, email: "", full_name: "Unknown" };
}

async function attachOwners(
  documents: DocumentRow[],
): Promise<DocumentWithOwner[]> {
  if (documents.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const ownerIds = [...new Set(documents.map((d) => d.owner_id))];
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", ownerIds);

  if (error) {
    return documents.map((doc) => ({
      ...doc,
      owner: stubOwner(doc.owner_id),
    }));
  }

  const byId = new Map(
    (profiles ?? []).map((p) => [p.id, p as Pick<Profile, "id" | "email" | "full_name">]),
  );

  return documents.map((doc) => ({
    ...doc,
    owner: byId.get(doc.owner_id) ?? stubOwner(doc.owner_id),
  }));
}

export async function getMyDocuments(userId: string): Promise<DocumentWithOwner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id, owner_id, title, content, created_at, updated_at")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return attachOwners((data ?? []) as DocumentRow[]);
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
    .select("id, owner_id, title, content, created_at, updated_at")
    .in("id", ids)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return attachOwners((data ?? []) as DocumentRow[]);
}

export async function getDocumentById(
  documentId: string,
): Promise<DocumentWithOwner | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id, owner_id, title, content, created_at, updated_at")
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const [withOwner] = await attachOwners([data as DocumentRow]);
  return withOwner;
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
