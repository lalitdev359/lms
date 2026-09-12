const steps = [
  {
    number: "01",
    title: "Create an account",
    description: "Sign up as a student to start learning, or as an instructor to start teaching.",
  },
  {
    number: "02",
    title: "Enroll or publish",
    description: "Students enroll in a course in one click. Instructors build modules and lessons, then publish.",
  },
  {
    number: "03",
    title: "Track real progress",
    description: "Every completed lesson updates your dashboard — no spreadsheets, no guesswork.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border-soft">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-24">
        <h2 className="font-display text-3xl md:text-4xl tracking-tight max-w-md">
          Set up in minutes, not sprints
        </h2>

        <div className="mt-10 grid md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step, i) => (
            <div key={step.number} className="relative pl-0">
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl text-ink-faint">{step.number}</span>
                {i < steps.length - 1 ? (
                  <span className="hidden md:block h-px flex-1 bg-border" />
                ) : null}
              </div>
              <h3 className="font-display text-lg mt-3">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
