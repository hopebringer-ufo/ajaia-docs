"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { shareDocumentAction } from "@/app/actions/shares";
import {
  shareDocumentSchema,
  type ShareDocumentInput,
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

type ShareDialogProps = {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShareDialog({
  documentId,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShareDocumentInput>({
    resolver: zodResolver(shareDocumentSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await shareDocumentAction(documentId, data.email);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Document shared successfully");
      reset({ email: "" });
      onOpenChange(false);
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>
            Enter the email of a registered user. They will be able to edit this
            document.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-email">Email</Label>
            <Input
              id="share-email"
              type="email"
              placeholder="colleague@example.com"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
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
              Share
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
