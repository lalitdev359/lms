import Link from "next/link";
import { getSession } from "@/lib/session";
import { LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export async function SiteNavbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-lg tracking-tight">Ridgeline</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-muted">
          <Link href="/courses" className="hover:text-ink transition-colors">
            Courses
          </Link>
          <Link href="/#instructors" className="hover:text-ink transition-colors">
            For instructors
          </Link>
          <Link href="/#how-it-works" className="hover:text-ink transition-colors">
            How it works
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <LinkButton href={`/dashboard/${session.role.toLowerCase()}`} size="sm">
              Go to dashboard
            </LinkButton>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                Log in
              </LinkButton>
              <LinkButton href="/register" size="sm">
                Get started
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
