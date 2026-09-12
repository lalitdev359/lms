import { query, queryOne } from "@/lib/db";
import type { Lesson } from "@/lib/types";

export async function listLessonsByModule(moduleId: string): Promise<Lesson[]> {
  return query<Lesson>(
    "SELECT * FROM lessons WHERE module_id = $1 ORDER BY position, created_at",
    [moduleId]
  );
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  return queryOne<Lesson>("SELECT * FROM lessons WHERE id = $1", [id]);
}

/** Lesson plus the course/module it belongs to, for access checks and breadcrumbs. */
export interface LessonWithCourse extends Lesson {
  course_id: string;
  course_title: string;
  course_slug: string;
  module_title: string;
}

export async function getLessonWithCourse(id: string): Promise<LessonWithCourse | null> {
  return queryOne<LessonWithCourse>(
    `SELECT l.*, c.id AS course_id, c.title AS course_title, c.slug AS course_slug, m.title AS module_title
     FROM lessons l
     JOIN modules m ON m.id = l.module_id
     JOIN courses c ON c.id = m.course_id
     WHERE l.id = $1`,
    [id]
  );
}

export async function createLesson(input: {
  moduleId: string;
  title: string;
  content: string;
  videoUrl: string | null;
  durationMinutes: number;
}): Promise<Lesson> {
  const posRow = await queryOne<{ next: string }>(
    "SELECT COALESCE(MAX(position), -1) + 1 AS next FROM lessons WHERE module_id = $1",
    [input.moduleId]
  );
  const position = Number(posRow?.next ?? 0);

  const row = await queryOne<Lesson>(
    `INSERT INTO lessons (module_id, title, content, video_url, duration_minutes, position)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [input.moduleId, input.title, input.content, input.videoUrl, input.durationMinutes, position]
  );
  if (!row) throw new Error("Failed to create lesson");
  return row;
}

export async function updateLesson(
  id: string,
  input: Partial<{ title: string; content: string; videoUrl: string | null; durationMinutes: number }>
): Promise<Lesson | null> {
  const fields: string[] = [];
  const params: unknown[] = [];
  const map: Record<string, string> = {
    title: "title",
    content: "content",
    videoUrl: "video_url",
    durationMinutes: "duration_minutes",
  };

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    params.push(value);
    fields.push(`${map[key]} = $${params.length}`);
  }
  if (fields.length === 0) return getLessonById(id);

  params.push(id);
  return queryOne<Lesson>(`UPDATE lessons SET ${fields.join(", ")} WHERE id = $${params.length} RETURNING *`, params);
}

export async function deleteLesson(id: string): Promise<void> {
  await query("DELETE FROM lessons WHERE id = $1", [id]);
}

export async function countLessonsByCourse(courseId: string): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `SELECT COUNT(l.id)::text AS count
     FROM lessons l JOIN modules m ON m.id = l.module_id
     WHERE m.course_id = $1`,
    [courseId]
  );
  return Number(row?.count ?? 0);
}
