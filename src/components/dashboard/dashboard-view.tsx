"use client";

import { useEffect, useMemo, useState } from "react";

import { CreateDocumentButton } from "@/components/dashboard/create-document-button";
import { DocumentList } from "@/components/dashboard/document-list";
import { SearchBox } from "@/components/dashboard/search-box";
import { useDebouncedValue } from "@/hooks/use-debounce";
import type { DocumentSummaryWithOwner } from "@/types";

type DashboardViewProps = {
  myDocuments: DocumentSummaryWithOwner[];
  sharedDocuments: DocumentSummaryWithOwner[];
  currentUserId: string;
  onDocumentDeleted?: (documentId: string) => void;
};

function filterDocs(docs: DocumentSummaryWithOwner[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return docs;
  return docs.filter((d) => {
    const owner =
      d.owner?.full_name?.toLowerCase() ?? d.owner?.email?.toLowerCase() ?? "";
    return d.title.toLowerCase().includes(q) || owner.includes(q);
  });
}

export function DashboardView({
  myDocuments,
  sharedDocuments,
  currentUserId,
  onDocumentDeleted,
}: DashboardViewProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);

  useEffect(() => {
    if (window.location.hash === "#shared") {
      document.getElementById("shared")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const filteredMine = useMemo(
    () => filterDocs(myDocuments, debouncedSearch),
    [myDocuments, debouncedSearch],
  );
  const filteredShared = useMemo(
    () => filterDocs(sharedDocuments, debouncedSearch),
    [sharedDocuments, debouncedSearch],
  );

  const searching = debouncedSearch.trim().length > 0;

  return (
    <div className="flex flex-1 flex-col gap-10 p-4 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Organize your work, collaborate with teammates, and pick up where you left off.
          </p>
        </div>
        <CreateDocumentButton />
      </div>
      <SearchBox value={search} onChange={setSearch} />
      <section aria-labelledby="my-documents-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="my-documents-heading" className="text-lg font-semibold">
            My Documents
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            {filteredMine.length} document{filteredMine.length === 1 ? "" : "s"}
          </span>
        </div>
        <DocumentList
          documents={filteredMine}
          currentUserId={currentUserId}
          onDocumentDeleted={onDocumentDeleted}
          emptyTitle={searching ? "No matching documents" : "No documents yet"}
          emptyDescription={
            searching
              ? "Try a different search term or clear the search box."
              : "Create a new document or import a .txt or .md file to get started."
          }
        />
      </section>
      <section id="shared" aria-labelledby="shared-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="shared-heading" className="text-lg font-semibold">
            Shared With Me
          </h2>
          <span className="text-xs font-medium text-muted-foreground">
            {filteredShared.length} document{filteredShared.length === 1 ? "" : "s"}
          </span>
        </div>
        <DocumentList
          documents={filteredShared}
          currentUserId={currentUserId}
          onDocumentDeleted={onDocumentDeleted}
          emptyTitle={searching ? "No matching shared documents" : "Nothing shared yet"}
          emptyDescription={
            searching
              ? "No shared documents match your search."
              : "When someone shares a document with your email, it will appear here."
          }
        />
      </section>
    </div>
  );
}
