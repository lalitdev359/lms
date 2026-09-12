import { NewCourseForm } from "@/components/dashboard/NewCourseForm";

export default function NewCoursePage() {
  return (
    <div className="px-5 md:px-10 py-8 md:py-10">
      <h1 className="font-display text-2xl md:text-3xl tracking-tight">Create a course</h1>
      <p className="mt-1.5 text-ink-muted">Starts as a draft — add modules and lessons, then publish when ready.</p>
      <div className="mt-8">
        <NewCourseForm />
      </div>
    </div>
  );
}
