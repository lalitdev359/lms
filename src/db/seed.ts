/**
 * Wipes and re-seeds the database with demo accounts and sample courses.
 * Run with: npm run db:seed
 */
try {
  process.loadEnvFile?.(".env");
} catch {
  // No .env file — fine when DATABASE_URL is already set in the environment
  // (e.g. inside Docker Compose).
}

import bcrypt from "bcryptjs";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const DEMO_PASSWORD = "password123";

type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

async function insertUser(name: string, email: string, role: Role, title: string | null = null) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO users (name, email, password_hash, role, title)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [name, email, passwordHash, role, title]
  );
  return rows[0].id;
}

async function insertCourse(opts: {
  instructorId: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  published: boolean;
}) {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO courses (instructor_id, title, slug, summary, description, category, level, published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [opts.instructorId, opts.title, opts.slug, opts.summary, opts.description, opts.category, opts.level, opts.published]
  );
  return rows[0].id;
}

async function insertModule(courseId: string, title: string, position: number) {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id`,
    [courseId, title, position]
  );
  return rows[0].id;
}

async function insertLesson(
  moduleId: string,
  title: string,
  content: string,
  position: number,
  durationMinutes = 12
) {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO lessons (module_id, title, content, duration_minutes, position)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [moduleId, title, content, durationMinutes, position]
  );
  return rows[0].id;
}

async function enroll(studentId: string, courseId: string) {
  await pool.query(
    `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [studentId, courseId]
  );
}

async function complete(studentId: string, lessonId: string) {
  await pool.query(
    `INSERT INTO lesson_progress (student_id, lesson_id, completed, completed_at)
     VALUES ($1, $2, true, now())
     ON CONFLICT (student_id, lesson_id) DO UPDATE SET completed = true, completed_at = now()`,
    [studentId, lessonId]
  );
}

async function main() {
  console.log("Clearing existing data...");
  await pool.query(
    "TRUNCATE lesson_progress, enrollments, lessons, modules, courses, users RESTART IDENTITY CASCADE"
  );

  console.log("Creating users...");
  const admin = await insertUser("Ava Ndiaye", "admin@lms.dev", "ADMIN");
  const marcus = await insertUser("Marcus Cole", "marcus@lms.dev", "INSTRUCTOR", "ML Engineer, ex-FAANG");
  const priya = await insertUser("Priya Rao", "priya@lms.dev", "INSTRUCTOR", "Full-stack developer & educator");
  const jordan = await insertUser("Jordan Lee", "jordan@lms.dev", "STUDENT");
  const sam = await insertUser("Sam Okafor", "sam@lms.dev", "STUDENT");

  console.log("Creating courses...");

  const promptCourse = await insertCourse({
    instructorId: marcus,
    title: "Prompt Engineering for Builders",
    slug: "prompt-engineering-for-builders",
    summary: "Write prompts that get reliable results out of modern language models.",
    description:
      "A hands-on course for developers and product people who want to get consistent, high-quality output from LLMs. You'll learn the anatomy of a strong prompt, common failure modes, and reusable patterns like chain-of-thought and few-shot examples that you can apply to real products.",
    category: "AI & ML",
    level: "Beginner",
    published: true,
  });
  const pFoundations = await insertModule(promptCourse, "Foundations", 0);
  const l1 = await insertLesson(
    pFoundations,
    "What is prompt engineering?",
    "Prompt engineering is the practice of designing inputs that reliably steer a language model toward the output you want. In this lesson we cover why wording, structure, and context matter as much as the underlying model, and set up the mental model we'll use for the rest of the course: instructions, context, examples, and constraints.",
    0,
    9
  );
  const l2 = await insertLesson(
    pFoundations,
    "Anatomy of a great prompt",
    "Every effective prompt tends to combine four ingredients: a clear task, relevant context, the output format you expect, and any constraints or edge cases the model should respect. We'll break down real prompts line by line and rewrite a weak prompt into a strong one together.",
    1,
    14
  );
  const l3 = await insertLesson(
    pFoundations,
    "Common pitfalls",
    "Vague instructions, missing context, and conflicting constraints are the top three reasons prompts fail in production. This lesson walks through failure examples and a checklist you can run before shipping any prompt.",
    2,
    10
  );
  const pAdvanced = await insertModule(promptCourse, "Advanced patterns", 1);
  const l4 = await insertLesson(
    pAdvanced,
    "Chain-of-thought prompting",
    "Asking a model to reason step by step before answering measurably improves accuracy on multi-step problems. We'll look at when chain-of-thought helps, when it just adds latency, and how to keep the reasoning hidden from end users when needed.",
    0,
    16
  );
  const l5 = await insertLesson(
    pAdvanced,
    "Few-shot examples",
    "Showing the model two or three examples of input/output pairs is often more effective than long instructions. This lesson covers how many examples to use, how to pick diverse ones, and how to keep your prompt from becoming a maintenance burden.",
    1,
    13
  );
  const l6 = await insertLesson(
    pAdvanced,
    "Building reusable templates",
    "Once a prompt works, the next problem is keeping it consistent across a codebase. We'll design a small template system with typed variables so your prompts stay testable and versioned like any other code.",
    2,
    18
  );

  const mlCourse = await insertCourse({
    instructorId: marcus,
    title: "Practical Machine Learning with Python",
    slug: "practical-machine-learning-with-python",
    summary: "Go from a clean dataset to a working, evaluated model.",
    description:
      "This course focuses on the parts of ML that actually take up most of a practitioner's time: cleaning data, choosing the right model for the problem, and evaluating it honestly. You'll work through a real dataset end to end using scikit-learn.",
    category: "AI & ML",
    level: "Intermediate",
    published: true,
  });
  const mlData = await insertModule(mlCourse, "Data foundations", 0);
  const l7 = await insertLesson(mlData, "Exploring a raw dataset", "Before modeling anything, you need to understand what you're working with. We'll profile a dataset for missing values, outliers, and class imbalance using pandas.", 0, 15);
  const l8 = await insertLesson(mlData, "Cleaning and feature engineering", "Turning raw columns into model-ready features is where most of the accuracy gains actually come from. This lesson covers encoding, scaling, and building a couple of derived features from scratch.", 1, 17);
  const mlModel = await insertModule(mlCourse, "Model building", 1);
  await insertLesson(mlModel, "Choosing a baseline model", "A simple baseline tells you whether your fancy model is actually earning its complexity. We'll set one up and talk about when to stop there.", 0, 11);
  await insertLesson(mlModel, "Evaluating honestly", "Accuracy alone can be misleading. We'll cover precision, recall, and cross-validation, and build an evaluation harness you can reuse on future projects.", 1, 19);

  const nextCourse = await insertCourse({
    instructorId: priya,
    title: "Modern Web Apps with Next.js",
    slug: "modern-web-apps-with-nextjs",
    summary: "Build full-stack apps with the App Router, server components, and real data.",
    description:
      "A project-based course on building production-shaped web apps with Next.js. You'll wire up routing, data fetching, authentication, and a database, and come away with patterns you can reuse on your own projects.",
    category: "Web Development",
    level: "Intermediate",
    published: true,
  });
  const nextBasics = await insertModule(nextCourse, "App Router basics", 0);
  const l11 = await insertLesson(nextBasics, "File-system routing", "The App Router maps folders to URLs and files like page.tsx and layout.tsx to what renders at each route. We'll build out a small route tree together.", 0, 10);
  await insertLesson(nextBasics, "Server and client components", "Understanding which parts of your UI run on the server versus the browser is the single most important mental model in modern Next.js. We'll draw the line clearly with examples.", 1, 14);
  const nextData = await insertModule(nextCourse, "Data & auth", 1);
  await insertLesson(nextData, "Fetching data on the server", "Server components can talk to a database directly, no API layer required. We'll fetch and render real rows from Postgres.", 0, 13);
  await insertLesson(nextData, "Sessions with signed cookies", "We'll implement a lightweight auth flow using a signed JWT stored in an httpOnly cookie, and protect routes based on the session.", 1, 16);

  const designCourse = await insertCourse({
    instructorId: priya,
    title: "UI Design Systems 101",
    slug: "ui-design-systems-101",
    summary: "Build a consistent, scalable design language for your product.",
    description:
      "Learn how to define design tokens, build a small component library, and keep a growing product visually consistent without a full-time designer on every feature.",
    category: "Design",
    level: "Beginner",
    published: true,
  });
  const designTokens = await insertModule(designCourse, "Design tokens", 0);
  await insertLesson(designTokens, "Color and type scales", "A good token system starts with a small, deliberate set of colors and a type scale with clear roles. We'll build both from scratch.", 0, 12);
  await insertLesson(designTokens, "Spacing and layout rules", "Consistent spacing is what makes an interface feel calm rather than chaotic. We'll define a spacing scale and layout grid you can reuse everywhere.", 1, 10);
  const designComponents = await insertModule(designCourse, "Component libraries", 1);
  await insertLesson(designComponents, "Building your first shared component", "We'll take a button from a one-off element to a documented, reusable component with variants.", 0, 14);

  // A draft course — visible to Marcus and admins, hidden from the public catalog.
  await insertCourse({
    instructorId: marcus,
    title: "Advanced Retrieval-Augmented Generation",
    slug: "advanced-rag-systems",
    summary: "Design retrieval pipelines that keep LLM answers grounded in your data.",
    description: "A deep dive into chunking strategies, embedding models, and evaluation for production RAG systems. Currently in development.",
    category: "AI & ML",
    level: "Advanced",
    published: false,
  });

  console.log("Enrolling students and recording progress...");
  await enroll(jordan, promptCourse);
  await complete(jordan, l1);
  await complete(jordan, l2);
  await complete(jordan, l3);
  await complete(jordan, l4);

  await enroll(jordan, nextCourse);
  await complete(jordan, l11);

  await enroll(sam, promptCourse);
  for (const lessonId of [l1, l2, l3, l4, l5, l6]) await complete(sam, lessonId);

  await enroll(sam, mlCourse);
  await complete(sam, l7);
  await complete(sam, l8);

  await enroll(sam, designCourse);

  console.log("✓ Seed complete.");
  console.log("\nDemo accounts (password: password123):");
  console.log(`  Admin:      admin@lms.dev`);
  console.log(`  Instructor: marcus@lms.dev / priya@lms.dev`);
  console.log(`  Student:    jordan@lms.dev / sam@lms.dev`);
  console.log({ admin, marcus, priya, jordan, sam });
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
