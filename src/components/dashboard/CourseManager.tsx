"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Badge, ProgressBar } from "@/components/ui/Primitives";
import type { CourseTree } from "@/lib/course-tree";
import type { RosterEntry } from "@/lib/repos/enrollments";

const CATEGORIES = ["AI & ML", "Web Development", "Design", "Data", "Business", "General"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

async function api(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

export function CourseManager({
  course,
  roster,
  backHref = "/dashboard/instructor",
}: {
  course: CourseTree;
  roster: RosterEntry[];
  backHref?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"curriculum" | "settings" | "roster">("curriculum");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  async function togglePublish() {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/courses/${course.id}`, {
        method: "PATCH",
        body: JSON.stringify({ published: !course.published }),
      });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setBusy(false);
    }
  }

  async function deleteCourse() {
    if (!confirm(`Delete "${course.title}"? This removes every module, lesson, and enrollment.`)) return;
    setBusy(true);
    try {
      await api(`/api/courses/${course.id}`, { method: "DELETE" });
      router.push(backHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setBusy(false);
    }
  }

  return (
    <div className="px-5 md:px-10 py-8 md:py-10 max-w-4xl">
      <Link href={backHref} className="text-sm text-ink-muted hover:text-ink transition-colors">
        ← All courses
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge tone={course.published ? "success" : "ember"}>{course.published ? "Published" : "Draft"}</Badge>
            <Badge tone="neutral">{course.category}</Badge>
            <Badge tone="accent">{course.level}</Badge>
          </div>
          <h1 className="font-display text-2xl md:text-3xl tracking-tight">{course.title}</h1>
          <p className="text-sm text-ink-faint mt-1">
            {course.module_count} modules · {course.lesson_count} lessons · {course.enrollment_count} enrolled
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/courses/${course.slug}`}
            className="text-sm text-ink-muted hover:text-ink transition-colors px-3 py-2"
          >
            View page
          </Link>
          <Button variant="secondary" onClick={togglePublish} disabled={busy}>
            {course.published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      <div className="mt-8 flex items-center gap-1 border-b border-border-soft">
        {(["curriculum", "settings", "roster"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "curriculum" ? <CurriculumTab course={course} onChange={refresh} /> : null}
        {tab === "settings" ? <SettingsTab course={course} onChange={refresh} onDelete={deleteCourse} busy={busy} /> : null}
        {tab === "roster" ? <RosterTab roster={roster} /> : null}
      </div>
    </div>
  );
}

function CurriculumTab({ course, onChange }: { course: CourseTree; onChange: () => void }) {
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addModule(e: React.FormEvent) {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setAddingModule(true);
    setError(null);
    try {
      await api(`/api/courses/${course.id}/modules`, {
        method: "POST",
        body: JSON.stringify({ title: newModuleTitle }),
      });
      setNewModuleTitle("");
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add module");
    } finally {
      setAddingModule(false);
    }
  }

  return (
    <div className="space-y-5">
      {course.modules.length === 0 ? (
        <p className="text-sm text-ink-muted">No modules yet — add your first one below.</p>
      ) : (
        course.modules.map((module, i) => (
          <ModuleCard key={module.id} module={module} index={i} onChange={onChange} />
        ))
      )}

      <form onSubmit={addModule} className="flex items-center gap-2 rounded-card border border-dashed border-border p-3">
        <Input
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="New module title, e.g. Getting Started"
          className="flex-1"
        />
        <Button type="submit" variant="secondary" disabled={addingModule || !newModuleTitle.trim()}>
          Add module
        </Button>
      </form>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

function ModuleCard({
  module,
  index,
  onChange,
}: {
  module: CourseTree["modules"][number];
  index: number;
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [addingLesson, setAddingLesson] = useState(false);
  const [busy, setBusy] = useState(false);

  async function saveTitle() {
    setBusy(true);
    try {
      await api(`/api/modules/${module.id}`, { method: "PATCH", body: JSON.stringify({ title }) });
      setEditing(false);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function removeModule() {
    if (!confirm(`Delete module "${module.title}" and all its lessons?`)) return;
    setBusy(true);
    try {
      await api(`/api/modules/${module.id}`, { method: "DELETE" });
      onChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-soft">
        <span className="text-xs text-ink-faint shrink-0">Module {index + 1}</span>
        {editing ? (
          <div className="flex-1 flex items-center gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1" autoFocus />
            <Button size="sm" onClick={saveTitle} disabled={busy}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setTitle(module.title); }}>
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <p className="flex-1 text-sm font-medium">{module.title}</p>
            <button onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-ink">
              Rename
            </button>
            <button onClick={removeModule} disabled={busy} className="text-xs text-danger hover:text-danger/80">
              Delete
            </button>
          </>
        )}
      </div>

      <div className="divide-y divide-border-soft">
        {module.lessons.map((lesson) => (
          <LessonRowEditable key={lesson.id} lesson={lesson} onChange={onChange} />
        ))}
      </div>

      <div className="p-3">
        {addingLesson ? (
          <NewLessonForm
            moduleId={module.id}
            onDone={() => {
              setAddingLesson(false);
              onChange();
            }}
            onCancel={() => setAddingLesson(false)}
          />
        ) : (
          <button
            onClick={() => setAddingLesson(true)}
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            + Add lesson
          </button>
        )}
      </div>
    </div>
  );
}

function LessonRowEditable({
  lesson,
  onChange,
}: {
  lesson: CourseTree["modules"][number]["lessons"][number];
  onChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.content);
  const [videoUrl, setVideoUrl] = useState(lesson.video_url ?? "");
  const [durationMinutes, setDurationMinutes] = useState(lesson.duration_minutes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/lessons/${lesson.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, content, videoUrl, durationMinutes }),
      });
      setEditing(false);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    setBusy(true);
    try {
      await api(`/api/lessons/${lesson.id}`, { method: "DELETE" });
      onChange();
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="px-4 py-4 space-y-3 bg-surface-2/50">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" />
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Lesson content" />
        <div className="grid grid-cols-2 gap-3">
          <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL (optional)" />
          <Input
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            placeholder="Minutes"
          />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={save} disabled={busy}>
            Save lesson
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="text-sm flex-1 truncate">{lesson.title}</span>
      <span className="text-xs text-ink-faint shrink-0">{lesson.duration_minutes} min</span>
      <button onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-ink shrink-0">
        Edit
      </button>
      <button onClick={remove} disabled={busy} className="text-xs text-danger hover:text-danger/80 shrink-0">
        Delete
      </button>
    </div>
  );
}

function NewLessonForm({
  moduleId,
  onDone,
  onCancel,
}: {
  moduleId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/api/modules/${moduleId}/lessons`, {
        method: "POST",
        body: JSON.stringify({ title, content, videoUrl, durationMinutes }),
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add lesson");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-border-soft bg-surface-2/50 p-3">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" required autoFocus />
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Lesson content (optional)" />
      <div className="grid grid-cols-2 gap-3">
        <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video URL (optional)" />
        <Input
          type="number"
          min={1}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          placeholder="Minutes"
        />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex items-center gap-2">
        <Button size="sm" type="submit" disabled={busy || !title.trim()}>
          Add lesson
        </Button>
        <Button size="sm" type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function SettingsTab({
  course,
  onChange,
  onDelete,
  busy,
}: {
  course: CourseTree;
  onChange: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [title, setTitle] = useState(course.title);
  const [summary, setSummary] = useState(course.summary);
  const [description, setDescription] = useState(course.description);
  const [category, setCategory] = useState(course.category);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>(course.level as (typeof LEVELS)[number]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api(`/api/courses/${course.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, summary, description, category, level }),
      });
      setSaved(true);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-8">
      <form onSubmit={save} className="space-y-5">
        <Field label="Title" htmlFor="s-title">
          <Input id="s-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>
        <Field label="Short summary" htmlFor="s-summary">
          <Input id="s-summary" value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={200} required />
        </Field>
        <Field label="Full description" htmlFor="s-description">
          <Textarea id="s-description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" htmlFor="s-category">
            <Select id="s-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Level" htmlFor="s-level">
            <Select id="s-level" value={level} onChange={(e) => setLevel(e.target.value as typeof level)}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {saved ? <span className="text-sm text-success">Saved</span> : null}
        </div>
      </form>

      <div className="pt-6 border-t border-border-soft">
        <p className="text-sm font-medium text-danger">Danger zone</p>
        <p className="text-sm text-ink-muted mt-1">
          Deleting a course removes all of its modules, lessons, enrollments, and progress. This can&apos;t be undone.
        </p>
        <Button variant="danger" className="mt-3" onClick={onDelete} disabled={busy}>
          Delete this course
        </Button>
      </div>
    </div>
  );
}

function RosterTab({ roster }: { roster: RosterEntry[] }) {
  if (roster.length === 0) {
    return <p className="text-sm text-ink-muted">No students enrolled yet.</p>;
  }

  return (
    <div className="rounded-card border border-border bg-surface divide-y divide-border-soft overflow-hidden">
      {roster.map((entry) => {
        const pct = entry.total_lessons ? Math.round((entry.completed_lessons / entry.total_lessons) * 100) : 0;
        return (
          <div key={entry.student_id} className="flex items-center gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">{entry.name}</p>
              <p className="text-xs text-ink-faint truncate">{entry.email}</p>
            </div>
            <div className="w-32 shrink-0">
              <ProgressBar value={pct} />
            </div>
            <span className="text-xs text-ink-faint w-16 text-right shrink-0">
              {entry.completed_lessons}/{entry.total_lessons}
            </span>
          </div>
        );
      })}
    </div>
  );
}
