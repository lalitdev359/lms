import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { getSession } from "@/lib/session";

export async function SiteFooter() {
  const session = await getSession();

  return (
    <footer className="mt-auto">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <span className="font-display text-sm">Ridgeline</span>
        </Link>
        <p className="text-xs text-ink-faint">A demo learning platform, built end to end.</p>
        <div className="flex items-center gap-5 text-sm text-ink-muted">
          <Link href="/courses" className="hover:text-ink transition-colors">
            Courses
          </Link>
          {session ? (
            <Link href={`/dashboard/${session.role.toLowerCase()}`} className="hover:text-ink transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="hover:text-ink transition-colors">
              Log in
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
