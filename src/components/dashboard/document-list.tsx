"use client";

import { FileText, Search } from "lucide-react";

import { DocumentCard } from "@/components/dashboard/document-card";
import type { DocumentWithOwner } from "@/types";

type DocumentListProps = {
  documents: DocumentWithOwner[];
  currentUserId: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function DocumentList({
  documents,
  currentUserId,
  emptyTitle,
  emptyDescription,
}: DocumentListProps) {
  if (documents.length === 0) {
    const isSearchEmpty = emptyTitle.toLowerCase().includes("matching");
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
        {isSearchEmpty ? (
          <Search className="mb-3 size-10 text-muted-foreground/80" />
        ) : (
          <FileText className="mb-3 size-10 text-muted-foreground/80" />
        )}
        <h3 className="text-lg font-medium">{emptyTitle}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {documents.map((doc) => (
        <li key={doc.id}>
          <DocumentCard
            document={doc}
            canManage={doc.owner_id === currentUserId}
          />
        </li>
      ))}
    </ul>
  );
}
