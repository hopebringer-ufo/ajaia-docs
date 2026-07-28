"use client";

import { useEffect, useState } from "react";

import { DashboardLoadError } from "@/components/dashboard/dashboard-load-error";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import type { DocumentSummaryWithOwner } from "@/types";

type DashboardShellProps = {
  userEmail: string;
  userId: string;
};

type LoadState = "loading" | "ready" | "error";

export function DashboardShell({ userEmail, userId }: DashboardShellProps) {
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [myDocuments, setMyDocuments] = useState<DocumentSummaryWithOwner[]>(
    [],
  );
  const [sharedDocuments, setSharedDocuments] = useState<
    DocumentSummaryWithOwner[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState("loading");
      try {
        const response = await fetch("/api/dashboard/documents", {
          credentials: "include",
          cache: "no-store",
        });
        const body = (await response.json()) as {
          error?: string;
          myDocuments?: DocumentSummaryWithOwner[];
          sharedDocuments?: DocumentSummaryWithOwner[];
        };

        if (cancelled) return;

        if (!response.ok || body.error) {
          setErrorMessage(body.error ?? `Request failed (${response.status})`);
          setState("error");
          return;
        }

        setMyDocuments(body.myDocuments ?? []);
        setSharedDocuments(body.sharedDocuments ?? []);
        setState("ready");
      } catch {
        if (!cancelled) {
          setErrorMessage("Network error while loading documents.");
          setState("error");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "error") {
    return <DashboardLoadError message={errorMessage} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar userEmail={userEmail} />
      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
          <div className="px-4 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Workspace
          </div>
          <Sidebar />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center border-b bg-background/80 px-3 py-2 lg:hidden">
            <Sidebar />
          </div>
          {state === "loading" ? (
            <div className="flex flex-col gap-6 p-8">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-full max-w-md" />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            <DashboardView
              myDocuments={myDocuments}
              sharedDocuments={sharedDocuments}
              currentUserId={userId}
            />
          )}
        </main>
      </div>
    </div>
  );
}
