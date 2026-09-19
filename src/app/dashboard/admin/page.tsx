import { getAdminInsights } from "@/lib/admin-insights";
import { AdminOverviewClient } from "@/components/dashboard/AdminOverviewClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const insights = await getAdminInsights();
  return <AdminOverviewClient initial={insights} />;
}
