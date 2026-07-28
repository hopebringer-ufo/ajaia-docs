import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="border-b bg-background px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-2/3 max-w-md" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <Skeleton className="mb-4 h-10 w-full" />
          <Skeleton className="h-[50vh] w-full" />
        </div>
      </div>
    </div>
  );
}
