import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { AuthShell } from "@/components/landing/AuthShell";
import { RegisterForm } from "@/components/landing/RegisterForm";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect(`/dashboard/${session.role.toLowerCase()}`);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start as a student or an instructor — you can always add courses later."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent/80">
            Log in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
