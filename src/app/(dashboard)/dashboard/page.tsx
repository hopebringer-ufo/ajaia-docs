import { redirect } from "next/navigation";

import { getSessionUser } from "@/app/actions/auth";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import {
  getMyDocuments,
  getSharedDocuments,
} from "@/services/documents";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const [myDocuments, sharedDocuments] = await Promise.all([
    getMyDocuments(user.id),
    getSharedDocuments(user.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar userEmail={user.email} />
      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
          <div className="px-4 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Workspace
          </div>
          <Sidebar />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center border-b bg-background/80 px-3 py-2 lg:hidden">
            <Sidebar />
          </div>
          <DashboardView
            myDocuments={myDocuments}
            sharedDocuments={sharedDocuments}
            currentUserId={user.id}
          />
        </main>
      </div>
    </div>
  );
}
