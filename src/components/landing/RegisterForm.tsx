"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

type RoleChoice = "STUDENT" | "INSTRUCTOR";

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<RoleChoice>("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/${role.toLowerCase()}`);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span className="block text-sm font-medium text-ink mb-1.5">I&apos;m joining as a</span>
        <div className="grid grid-cols-2 gap-2">
          {(["STUDENT", "INSTRUCTOR"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRole(option)}
              className={clsx(
                "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                role === option
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border bg-surface-2 text-ink-muted hover:border-ink-faint"
              )}
            >
              {option === "STUDENT" ? "Student" : "Instructor"}
            </button>
          ))}
        </div>
      </div>

      <Field label="Full name" htmlFor="name">
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" />
      </Field>
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
      <Field label="Password" htmlFor="password" hint="At least 8 characters">
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
