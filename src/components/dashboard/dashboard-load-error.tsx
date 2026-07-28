import Link from "next/link";

import { Button } from "@/components/ui/button";

type DashboardLoadErrorProps = {
  message: string;
  showActions?: boolean;
};

export function DashboardLoadError({
  message,
  showActions = true,
}: DashboardLoadErrorProps) {
  const missingTables =
    /schema cache|does not exist|relation.*does not exist/i.test(message);

  const missingEnv = /NEXT_PUBLIC_SUPABASE/i.test(message);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold">Dashboard could not load</h1>
      {missingTables ? (
        <p className="max-w-lg text-sm text-muted-foreground">
          Your Supabase project does not have the app tables yet. Open the Supabase
          SQL Editor for project{" "}
          <strong>warajsujforjadznfxzh</strong> and run both migration files from
          this repo, in order:
          <br />
          <code className="mt-2 block text-left text-xs">
            supabase/migrations/001_initial_schema.sql
            <br />
            supabase/migrations/002_document_update_guard.sql
          </code>
        </p>
      ) : missingEnv ? (
        <p className="max-w-lg text-sm text-muted-foreground">
          Supabase environment variables are missing on Netlify. Add{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then redeploy.
        </p>
      ) : (
        <p className="max-w-lg text-sm text-muted-foreground">
          Could not load your documents from Supabase.
        </p>
      )}
      <p className="max-w-lg rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        {message}
      </p>
      {showActions ? (
        <div className="flex flex-wrap justify-center gap-2">
          <Button render={<Link href="/dashboard" />}>Try again</Button>
          <Button render={<Link href="/login" />} variant="outline">
            Sign in again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
