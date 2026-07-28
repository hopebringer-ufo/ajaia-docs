import Link from "next/link";

import { getSessionUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const user = await getSessionUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you are looking for does not exist or may have been removed.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {user ? (
          <Button render={<Link href="/dashboard" />}>Go to dashboard</Button>
        ) : (
          <Button render={<Link href="/login" />}>Sign in</Button>
        )}
      </div>
    </div>
  );
}
