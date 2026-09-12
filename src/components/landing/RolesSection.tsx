import { Card } from "@/components/ui/Primitives";

const roles = [
  {
    tag: "Students",
    title: "Learn at your own pace, with a clear map of what's left",
    points: [
      "Enroll in a course and pick up exactly where you left off",
      "Track completed lessons per module, not just an overall percentage",
      "See every enrolled course in one dashboard",
    ],
  },
  {
    tag: "Instructors",
    title: "Build a course structure without fighting a page builder",
    points: [
      "Organize content into modules and lessons with drag-free reordering",
      "Publish when ready — drafts stay invisible to the public catalog",
      "See enrollment and completion per student on every course",
    ],
  },
  {
    tag: "Admins",
    title: "Oversight across every course and account on the platform",
    points: [
      "Platform-wide stats: users, courses, enrollments, completions",
      "Manage roles — promote an instructor or step in on any course",
      "One place to see what's published and what's still a draft",
    ],
  },
];

export function RolesSection() {
  return (
    <section id="instructors" className="border-b border-border-soft">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl md:text-4xl tracking-tight">
            One platform, three ways to use it
          </h2>
          <p className="mt-3 text-ink-muted">
            Every account gets a dashboard shaped around what it actually needs to do.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {roles.map((role) => (
            <Card key={role.tag} className="p-6 flex flex-col">
              <span className="text-xs font-medium text-accent">{role.tag}</span>
              <h3 className="font-display text-lg mt-2 leading-snug">{role.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
                {role.points.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-faint shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
