import { NextResponse } from "next/server";
import { getAdminInsights } from "@/lib/admin-insights";
import { requireSession, handleApiError } from "@/lib/api-auth";

export async function GET() {
  try {
    await requireSession(["ADMIN"]);
    const insights = await getAdminInsights();
    return NextResponse.json(insights);
  } catch (err) {
    return handleApiError(err);
  }
}
