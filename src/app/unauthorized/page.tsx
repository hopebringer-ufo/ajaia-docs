import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24">
      <h1 className="text-2xl font-semibold">Unauthorized</h1>
      <p className="max-w-md text-center text-muted-foreground">
        You do not have permission to view this resource. Sign in with an
        account that has access.
      </p>
      <Button render={<Link href="/login" />}>Sign in</Button>
    </div>
  );
}
