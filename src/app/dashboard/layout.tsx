import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTopbar } from "@/components/dashboard/MobileTopbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <Sidebar role={session.role} name={session.name} email={session.email} />
      <div className="flex-1 min-w-0">
        <MobileTopbar role={session.role} />
        {children}
      </div>
    </div>
  );
}
