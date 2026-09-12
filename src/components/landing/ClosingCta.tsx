import { LinkButton } from "@/components/ui/Button";

export function ClosingCta() {
  return (
    <section className="border-b border-border-soft">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-20">
        <div className="rounded-2xl border border-border bg-surface px-8 py-12 md:py-16 text-center relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(circle at 50% 0%, #7C6CF6, transparent 60%)" }}
          />
          <h2 className="font-display text-3xl md:text-4xl tracking-tight relative">
            Ready to jump in?
          </h2>
          <p className="mt-3 text-ink-muted relative max-w-md mx-auto">
            Create a free account and get access to every published course on Ridgeline.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3 relative">
            <LinkButton href="/register" size="lg">
              Create your account
            </LinkButton>
            <LinkButton href="/courses" variant="secondary" size="lg">
              Browse courses first
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
