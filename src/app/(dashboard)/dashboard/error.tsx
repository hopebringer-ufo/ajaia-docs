"use client";

import { DashboardLoadError } from "@/components/dashboard/dashboard-load-error";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <DashboardLoadError message="The dashboard failed to load. Try again or sign in." />
      <div className="flex justify-center pb-8">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
