import { redirect } from "next/navigation";

import { getSessionUser } from "@/app/actions/auth";

export default async function HomePage() {
  const user = await getSessionUser();
  redirect(user ? "/dashboard" : "/login");
}
