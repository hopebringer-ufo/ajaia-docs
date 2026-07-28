"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { renameDocumentAction } from "@/app/actions/documents";
import {
  renameDocumentSchema,
  type RenameDocumentInput,
} from "@/lib/validations/document";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RenameDialogProps = {
  documentId: string;
  currentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenamed?: (title: string) => void;
};

export function RenameDialog({
  documentId,
  currentTitle,
  open,
  onOpenChange,
  onRenamed,
}: RenameDialogProps) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RenameDocumentInput>({
    resolver: zodResolver(renameDocumentSchema),
    defaultValues: { title: currentTitle },
  });

  useEffect(() => {
    if (open) {
      reset({ title: currentTitle });
    }
  }, [open, currentTitle, reset]);

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await renameDocumentAction(documentId, data.title);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Document renamed");
      onRenamed?.(result.data.title);
      onOpenChange(false);
      reset({ title: result.data.title });
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename document</DialogTitle>
          <DialogDescription>
            Choose a clear title so teammates can find this document easily.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rename-title">Title</Label>
            <Input id="rename-title" {...register("title")} />
            {errors.title ? (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
