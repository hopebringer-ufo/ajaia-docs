import { redirect } from "next/navigation";

import { getSessionUser } from "@/app/actions/auth";
import { DashboardLoadError } from "@/components/dashboard/dashboard-load-error";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const user = await getSessionUser();
    if (!user) {
      redirect("/login");
    }

    return (
      <DashboardShell
        userEmail={user.email ?? ""}
        userId={user.id}
      />
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load dashboard.";
    return <DashboardLoadError message={message} />;
  }
}
