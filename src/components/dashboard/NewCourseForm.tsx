"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";

const CATEGORIES = ["AI & ML", "Web Development", "Design", "Data", "Business", "General"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export function NewCourseForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("Beginner");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, summary, description, category, level }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Couldn't create the course");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/instructor/courses/${data.course.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <Field label="Title" htmlFor="title">
        <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Intro to Systems Design" />
      </Field>

      <Field label="Short summary" htmlFor="summary" hint="Shown on course cards — one sentence is plenty">
        <Input
          id="summary"
          required
          maxLength={200}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="A practical introduction to designing systems that scale."
        />
      </Field>

      <Field label="Full description" htmlFor="description">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What will students learn? Who is this course for?"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category" htmlFor="category">
          <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Level" htmlFor="level">
          <Select id="level" value={level} onChange={(e) => setLevel(e.target.value as typeof level)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Creating…" : "Create course"}
      </Button>
    </form>
  );
}
