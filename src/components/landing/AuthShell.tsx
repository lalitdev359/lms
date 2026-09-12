import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-surface border-r border-border-soft flex-col justify-between p-10">
        <div
          className="pointer-events-none absolute -bottom-32 -left-24 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #7C6CF6, transparent 70%)" }}
        />
        <Link href="/" className="flex items-center gap-2 relative">
          <Logo />
          <span className="font-display text-lg">Ridgeline</span>
        </Link>
        <div className="relative">
          <p className="font-display text-3xl leading-tight max-w-sm">
            &ldquo;The lesson-level progress tracking is the whole reason we switched.&rdquo;
          </p>
          <p className="mt-4 text-sm text-ink-muted">Priya Rao — Instructor, Modern Web Apps with Next.js</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <Logo />
            <span className="font-display text-lg">Ridgeline</span>
          </Link>
          <h1 className="font-display text-2xl tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <div className="mt-6 text-sm text-ink-muted">{footer}</div>
        </div>
      </div>
    </div>
  );
}
