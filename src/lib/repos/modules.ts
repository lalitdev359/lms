import { query, queryOne } from "@/lib/db";
import type { CourseModule } from "@/lib/types";

export async function listModulesByCourse(courseId: string): Promise<CourseModule[]> {
  return query<CourseModule>(
    "SELECT * FROM modules WHERE course_id = $1 ORDER BY position, created_at",
    [courseId]
  );
}

export async function getModuleById(id: string): Promise<CourseModule | null> {
  return queryOne<CourseModule>("SELECT * FROM modules WHERE id = $1", [id]);
}

export async function createModule(courseId: string, title: string): Promise<CourseModule> {
  const { rows } = await queryPosition(courseId);
  const row = await queryOne<CourseModule>(
    `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING *`,
    [courseId, title, rows]
  );
  if (!row) throw new Error("Failed to create module");
  return row;
}

async function queryPosition(courseId: string): Promise<{ rows: number }> {
  const row = await queryOne<{ next: string }>(
    "SELECT COALESCE(MAX(position), -1) + 1 AS next FROM modules WHERE course_id = $1",
    [courseId]
  );
  return { rows: Number(row?.next ?? 0) };
}

export async function updateModule(id: string, title: string): Promise<CourseModule | null> {
  return queryOne<CourseModule>("UPDATE modules SET title = $2 WHERE id = $1 RETURNING *", [id, title]);
}

export async function deleteModule(id: string): Promise<void> {
  await query("DELETE FROM modules WHERE id = $1", [id]);
}
