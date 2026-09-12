"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function CompleteToggle({ lessonId, initialCompleted }: { lessonId: string; initialCompleted: boolean }) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  async function toggle() {
    const next = !completed;
    setCompleted(next);
    const res = await fetch(`/api/lessons/${lessonId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: next }),
    });
    if (!res.ok) {
      setCompleted(!next);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <Button
      onClick={toggle}
      disabled={pending}
      variant={completed ? "secondary" : "primary"}
      size="md"
    >
      {completed ? "✓ Completed" : "Mark as complete"}
    </Button>
  );
}
