"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isConfig =
    error.message.includes("NEXT_PUBLIC_SUPABASE") ||
    error.message.includes("Environment variables");

  const isSchema =
    error.message.includes("relation") ||
    error.message.includes("does not exist") ||
    error.message.includes("permission denied");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold">Dashboard could not load</h1>
      <p className="max-w-lg text-sm text-muted-foreground">
        {isConfig
          ? "Supabase environment variables are missing on Netlify. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy."
          : isSchema
            ? "Database tables or RLS may be missing. Run supabase/migrations/001 and 002 in your Supabase SQL editor."
            : "A server error occurred while loading your documents."}
      </p>
      <p className="max-w-lg text-xs text-muted-foreground">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
