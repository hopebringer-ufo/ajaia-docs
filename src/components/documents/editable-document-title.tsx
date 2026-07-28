"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { renameDocumentAction } from "@/app/actions/documents";
import { cn } from "@/lib/utils";

type EditableDocumentTitleProps = {
  documentId: string;
  initialTitle: string;
  canEdit: boolean;
};

export function EditableDocumentTitle({
  documentId,
  initialTitle,
  canEdit,
}: EditableDocumentTitleProps) {
  const [title, setTitle] = useState(initialTitle);
  const [draft, setDraft] = useState(initialTitle);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setDraft(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    if (!canEdit) return;

    const next = draft.trim() || "Untitled document";
    setEditing(false);

    if (next === title) {
      setDraft(title);
      return;
    }

    const previous = title;
    setTitle(next);
    setDraft(next);

    startTransition(async () => {
      const result = await renameDocumentAction(documentId, next);
      if (!result.success) {
        setTitle(previous);
        setDraft(previous);
        toast.error(result.error);
        return;
      }
      setTitle(result.data.title);
      setDraft(result.data.title);
      document.title = `${result.data.title} · Ajaia Docs`;
    });
  };

  const cancel = () => {
    setDraft(title);
    setEditing(false);
  };

  if (!canEdit) {
    return (
      <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight">
        {title}
      </h1>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          "min-w-0 max-w-full truncate rounded-md px-1.5 py-0.5 text-left text-xl font-semibold tracking-tight",
          "hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          pending && "opacity-70",
        )}
        title="Rename"
        aria-label="Rename document"
      >
        {title}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          cancel();
        }
      }}
      maxLength={200}
      disabled={pending}
      aria-label="Document title"
      className={cn(
        "min-w-0 flex-1 rounded-md border border-transparent bg-muted/50 px-1.5 py-0.5 text-xl font-semibold tracking-tight",
        "outline-none ring-2 ring-ring",
      )}
    />
  );
}
