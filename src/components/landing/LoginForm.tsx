"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      router.push(next || `/dashboard/${data.user.role.toLowerCase()}`);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Signing in…" : "Log in"}
      </Button>

      <div className="pt-2 border-t border-border-soft">
        <p className="text-xs text-ink-faint mb-2 mt-3">Demo accounts (password: password123)</p>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {[
            ["Admin", "admin@lms.dev"],
            ["Instructor", "marcus@lms.dev"],
            ["Student", "jordan@lms.dev"],
          ].map(([label, demoEmail]) => (
            <button
              key={demoEmail}
              type="button"
              onClick={() => {
                setEmail(demoEmail);
                setPassword("password123");
              }}
              className="rounded-lg border border-border bg-surface-2 px-2 py-2 text-ink-muted hover:border-ink-faint hover:text-ink transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
