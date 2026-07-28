"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DeleteDialog } from "@/components/documents/delete-dialog";
import { RenameDialog } from "@/components/documents/rename-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { DocumentWithOwner } from "@/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

type DocumentCardProps = {
  document: DocumentWithOwner;
  canManage: boolean;
};

export function DocumentCard({ document, canManage }: DocumentCardProps) {
  const router = useRouter();
  const [title, setTitle] = useState(document.title);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const ownerLabel =
    document.owner?.full_name || document.owner?.email || "Unknown";

  return (
    <>
      <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-2 text-base leading-snug">{title}</CardTitle>
          <CardDescription className="line-clamp-1">
            Owner · {ownerLabel}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Updated {formatDate(document.updated_at)}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t-0 bg-transparent pt-0">
          <Button render={<Link href={`/documents/${document.id}`} />} size="sm">
            Open
          </Button>
          {canManage ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRenameOpen(true)}
              >
                Rename
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="More actions"
                    />
                  }
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                    <Pencil className="size-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null}
        </CardFooter>
      </Card>
      {canManage ? (
        <>
          <RenameDialog
            documentId={document.id}
            currentTitle={title}
            open={renameOpen}
            onOpenChange={setRenameOpen}
            onRenamed={setTitle}
          />
          <DeleteDialog
            documentId={document.id}
            title={title}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onDeleted={() => router.refresh()}
          />
        </>
      ) : null}
    </>
  );
}
