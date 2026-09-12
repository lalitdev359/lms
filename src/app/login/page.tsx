import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AuthShell } from "@/components/landing/AuthShell";
import { LoginForm } from "@/components/landing/LoginForm";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(`/dashboard/${session.role.toLowerCase()}`);

  const { next } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to pick up where you left off."
      footer={
        <p>
          New to Ridgeline?{" "}
          <Link href="/register" className="text-accent hover:text-accent/80">
            Create an account
          </Link>
        </p>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
