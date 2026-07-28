"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Menu, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "My Documents", icon: FileText, section: "mine" },
  {
    href: "/dashboard#shared",
    label: "Shared With Me",
    icon: Users,
    section: "shared",
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"mine" | "shared">("mine");

  useEffect(() => {
    const sync = () => {
      setActiveSection(
        window.location.hash === "#shared" ? "shared" : "mine",
      );
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const nav = (
    <nav className="flex flex-col gap-1 p-2" aria-label="Workspace navigation">
      {links.map(({ href, label, icon: Icon, section }) => {
        const active = pathname === "/dashboard" && activeSection === section;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => {
              setOpen(false);
              setActiveSection(section);
            }}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </Button>
      <div className="hidden lg:block">{nav}</div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-72 border-r bg-sidebar shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <span className="font-medium">Workspace</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}
    </>
  );
}
