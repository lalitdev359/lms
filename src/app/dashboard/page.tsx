import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function DashboardIndexPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(`/dashboard/${session.role.toLowerCase()}`);
}
