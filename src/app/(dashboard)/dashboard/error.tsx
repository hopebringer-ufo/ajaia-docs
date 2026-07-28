"use client";

import { DashboardLoadError } from "@/components/dashboard/dashboard-load-error";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const fallback =
    error.digest
      ? `Server error (digest: ${error.digest}). Redeploy the latest build and check Netlify env vars.`
      : "Unexpected server error.";

  const message =
    error.message &&
    !error.message.includes("omitted in production builds")
      ? error.message
      : fallback;

  return (
    <div className="space-y-4">
      <DashboardLoadError message={message} />
      <div className="flex justify-center pb-8">
        <button
          type="button"
          onClick={() => reset()}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
