import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-8 shadow-sm ring-1 ring-foreground/5">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Ajaia Docs
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to continue to your workspace.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
        {process.env.NODE_ENV === "development" ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Dev demo: test@test.com / Password1
          </p>
        ) : null}
      </div>
    </div>
  );
}
