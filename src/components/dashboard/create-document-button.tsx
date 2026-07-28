"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilePlus, Upload } from "lucide-react";
import { toast } from "sonner";

import { createDocumentAction, importDocumentAction } from "@/app/actions/documents";
import { Button } from "@/components/ui/button";
import {
  fileImportErrorMessage,
  readImportFileAsHtml,
  validateImportFile,
} from "@/utils/file-import";

export function CreateDocumentButton() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const createBlank = () => {
    startTransition(async () => {
      const result = await createDocumentAction();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Document created");
      router.push(`/documents/${result.data.id}`);
    });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validationError = validateImportFile(file);
    if (validationError) {
      toast.error(fileImportErrorMessage(validationError));
      return;
    }

    startTransition(async () => {
      try {
        const html = await readImportFileAsHtml(file);
        const title = file.name.replace(/\.(txt|md)$/i, "") || "Imported document";
        const result = await importDocumentAction(title, html);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Document imported");
        router.push(`/documents/${result.data.id}`);
      } catch {
        toast.error(fileImportErrorMessage("read_failed"));
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={createBlank} disabled={pending}>
        <FilePlus className="size-4" />
        Create document
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="size-4" />
        Import .txt / .md
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.md,text/plain,text/markdown"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
