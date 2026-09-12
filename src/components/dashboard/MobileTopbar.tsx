import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import type { Role } from "@/lib/types";

export function MobileTopbar({ role }: { role: Role }) {
  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-border-soft bg-surface/95 backdrop-blur">
      <Link href={`/dashboard/${role.toLowerCase()}`} className="flex items-center gap-2">
        <Logo className="h-6 w-6" />
        <span className="font-display text-sm">Ridgeline</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/courses" className="text-sm text-ink-muted">
          Courses
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
