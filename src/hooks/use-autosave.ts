import { useEffect, useRef, useState } from "react";

import type { SaveStatus } from "@/types";

const AUTOSAVE_DELAY_MS = 2000;

export function useAutosave(options: {
  content: string;
  initialContent: string;
  onSave: (content: string) => Promise<{ success: boolean; error?: string }>;
  enabled?: boolean;
}) {
  const { content, initialContent, onSave, enabled = true } = options;
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialContent);
  const savingRef = useRef(false);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    lastSavedRef.current = initialContent;
  }, [initialContent]);

  useEffect(() => {
    if (!enabled) return;

    if (content === lastSavedRef.current) {
      setStatus((s) => (s === "unsaved" || s === "error" ? "saved" : s));
      return;
    }

    setStatus("unsaved");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      const snapshot = contentRef.current;
      if (savingRef.current || snapshot === lastSavedRef.current) return;

      savingRef.current = true;
      setStatus("saving");
      const result = await onSave(snapshot);
      savingRef.current = false;

      if (!result.success) {
        setStatus("error");
        return;
      }

      if (contentRef.current === snapshot) {
        lastSavedRef.current = snapshot;
        setStatus("saved");
      } else {
        setStatus("unsaved");
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, enabled, onSave]);

  return { status, AUTOSAVE_DELAY_MS };
}

export { AUTOSAVE_DELAY_MS };
