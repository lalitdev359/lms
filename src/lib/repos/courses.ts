import { query, queryOne } from "@/lib/db";
import type { Course, Level } from "@/lib/types";

export interface CourseCard extends Course {
  instructor_name: string;
  module_count: number;
  lesson_count: number;
  enrollment_count: number;
}

const CARD_SELECT = `
  SELECT
    c.*,
    u.name AS instructor_name,
    COUNT(DISTINCT m.id)::int AS module_count,
    COUNT(DISTINCT l.id)::int AS lesson_count,
    COUNT(DISTINCT e.id)::int AS enrollment_count
  FROM courses c
  JOIN users u ON u.id = c.instructor_id
  LEFT JOIN modules m ON m.course_id = c.id
  LEFT JOIN lessons l ON l.module_id = m.id
  LEFT JOIN enrollments e ON e.course_id = c.id
`;

export async function listPublishedCourses(opts?: {
  category?: string;
  search?: string;
}): Promise<CourseCard[]> {
  const conditions = ["c.published = true"];
  const params: unknown[] = [];

  if (opts?.category && opts.category !== "All") {
    params.push(opts.category);
    conditions.push(`c.category = $${params.length}`);
  }
  if (opts?.search) {
    params.push(`%${opts.search}%`);
    conditions.push(`(c.title ILIKE $${params.length} OR c.summary ILIKE $${params.length})`);
  }

  return query<CourseCard>(
    `${CARD_SELECT} WHERE ${conditions.join(" AND ")}
     GROUP BY c.id, u.name
     ORDER BY c.created_at DESC`,
    params
  );
}

export async function listCoursesByInstructor(instructorId: string): Promise<CourseCard[]> {
  return query<CourseCard>(
    `${CARD_SELECT} WHERE c.instructor_id = $1
     GROUP BY c.id, u.name
     ORDER BY c.created_at DESC`,
    [instructorId]
  );
}

export async function getCourseById(id: string): Promise<CourseCard | null> {
  return queryOne<CourseCard>(`${CARD_SELECT} WHERE c.id = $1 GROUP BY c.id, u.name`, [id]);
}

export async function getCourseBySlug(slug: string): Promise<CourseCard | null> {
  return queryOne<CourseCard>(`${CARD_SELECT} WHERE c.slug = $1 GROUP BY c.id, u.name`, [slug]);
}

export async function listAllCourses(): Promise<CourseCard[]> {
  return query<CourseCard>(
    `${CARD_SELECT} GROUP BY c.id, u.name ORDER BY c.created_at DESC`
  );
}

export async function listCategories(): Promise<string[]> {
  const rows = await query<{ category: string }>(
    "SELECT DISTINCT category FROM courses WHERE published = true ORDER BY category"
  );
  return rows.map((r) => r.category);
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "course"
  );
}

export async function createCourse(input: {
  instructorId: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  level: Level;
}): Promise<Course> {
  const base = slugify(input.title);
  let slug = base;
  let attempt = 1;
  // Ensure slug uniqueness without a separate transaction — collisions are rare.
  while (await queryOne("SELECT 1 FROM courses WHERE slug = $1", [slug])) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }

  const row = await queryOne<Course>(
    `INSERT INTO courses (instructor_id, title, slug, summary, description, category, level)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [input.instructorId, input.title, slug, input.summary, input.description, input.category, input.level]
  );
  if (!row) throw new Error("Failed to create course");
  return row;
}

export async function updateCourse(
  id: string,
  input: Partial<{
    title: string;
    summary: string;
    description: string;
    category: string;
    level: Level;
    published: boolean;
  }>
): Promise<Course | null> {
  const fields: string[] = [];
  const params: unknown[] = [];

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    params.push(value);
    fields.push(`${key} = $${params.length}`);
  }
  if (fields.length === 0) return getCourseById(id);

  params.push(id);
  fields.push("updated_at = now()");
  return queryOne<Course>(
    `UPDATE courses SET ${fields.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params
  );
}

export async function deleteCourse(id: string): Promise<void> {
  await query("DELETE FROM courses WHERE id = $1", [id]);
}
