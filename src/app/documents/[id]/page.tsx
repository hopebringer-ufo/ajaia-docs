import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getSessionUser } from "@/app/actions/auth";
import { EditableDocumentTitle } from "@/components/documents/editable-document-title";
import { DocumentEditor } from "@/components/editor/document-editor";
import { Navbar } from "@/components/layout/navbar";
import { getDocumentById } from "@/services/documents";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/documents/${id}`)}`);
  }

  const document = await getDocumentById(id);
  if (!document) {
    notFound();
  }

  const isOwner = document.owner_id === user.id;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar userEmail={user.email} />
      <div className="border-b bg-background/90 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to documents
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <EditableDocumentTitle
              documentId={document.id}
              initialTitle={document.title}
              canEdit={isOwner}
            />
            {!isOwner ? (
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                Shared with you
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6">
        <div className="flex min-h-[70vh] flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm ring-1 ring-foreground/5">
          <DocumentEditor
            key={document.id}
            documentId={document.id}
            initialContent={document.content}
            canShare={isOwner}
            isSharedView={!isOwner}
          />
        </div>
      </div>
    </div>
  );
}
