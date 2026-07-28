"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { updateDocumentContentAction } from "@/app/actions/documents";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { ShareDialog } from "@/components/documents/share-dialog";
import { useAutosave } from "@/hooks/use-autosave";
import type { SaveStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DocumentEditorProps = {
  documentId: string;
  initialContent: string;
  canShare: boolean;
  isSharedView?: boolean;
};

function statusLabel(status: SaveStatus): string {
  switch (status) {
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "unsaved":
      return "Unsaved changes";
    case "error":
      return "Save failed — retry by editing";
    default:
      return "";
  }
}

export function DocumentEditor({
  documentId,
  initialContent,
  canShare,
  isSharedView = false,
}: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [shareOpen, setShareOpen] = useState(false);

  const save = useCallback(
    async (html: string) => {
      const result = await updateDocumentContentAction(documentId, html);
      if (result.success) {
        return { success: true as const };
      }
      return { success: false as const, error: result.error };
    },
    [documentId],
  );

  const { status } = useAutosave({
    content,
    initialContent,
    onSave: save,
  });

  const lastStatusRef = useRef<SaveStatus>("idle");
  useEffect(() => {
    if (status === "error" && lastStatusRef.current !== "error") {
      toast.error("Could not save your changes. They remain on this device.");
    }
    lastStatusRef.current = status;
  }, [status]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      HorizontalRule,
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "max-w-none min-h-[55vh] px-8 py-8 text-base leading-relaxed focus:outline-none ProseMirror sm:px-10 sm:py-10",
        role: "textbox",
        "aria-label": isSharedView
          ? "Shared document editor"
          : "Document editor",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor: ed }) => {
      setContent(ed.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div
        className="sticky top-14 z-30 flex flex-wrap items-center justify-between gap-3 border-b bg-background/95 px-3 py-2 backdrop-blur sm:px-4"
        role="toolbar"
        aria-label="Formatting toolbar"
      >
        <EditorToolbar editor={editor} />
        <div className="flex items-center gap-2 pr-1">
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              status === "unsaved" && "text-amber-600 dark:text-amber-400",
              status === "saved" && "text-muted-foreground",
              status === "saving" && "text-muted-foreground",
              status === "error" && "text-destructive",
            )}
            aria-live="polite"
          >
            {statusLabel(status)}
          </span>
          {canShare ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShareOpen(true)}
            >
              Share
            </Button>
          ) : null}
        </div>
      </div>
      <EditorContent editor={editor} className="flex-1 bg-card" />
      {canShare ? (
        <ShareDialog
          documentId={documentId}
          open={shareOpen}
          onOpenChange={setShareOpen}
        />
      ) : null}
    </div>
  );
}
