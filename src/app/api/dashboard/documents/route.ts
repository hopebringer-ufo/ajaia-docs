import { NextResponse } from "next/server";

import { getSessionUser } from "@/app/actions/auth";
import {
  getMyDocuments,
  getSharedDocuments,
} from "@/services/documents";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let myDocuments;
    let sharedDocuments;
    try {
      [myDocuments, sharedDocuments] = await Promise.all([
        getMyDocuments(user.id),
        getSharedDocuments(user.id),
      ]);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load documents.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
      myDocuments,
      sharedDocuments,
      userId: user.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Dashboard API failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
