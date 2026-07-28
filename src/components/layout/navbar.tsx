import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

type NavbarProps = {
  userEmail?: string | null;
};

export function Navbar({ userEmail }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight sm:text-lg"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            A
          </span>
          <span className="hidden sm:inline">Ajaia Docs</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {userEmail ? (
            <span
              className="hidden max-w-[200px] truncate text-sm text-muted-foreground md:inline"
              title={userEmail}
            >
              {userEmail}
            </span>
          ) : null}
          <ThemeToggle />
          {userEmail ? (
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                Log out
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}
