import { query, queryOne } from "@/lib/db";
import type { LessonProgress } from "@/lib/types";

export async function getCompletedLessonIds(studentId: string, courseId: string): Promise<Set<string>> {
  const rows = await query<{ lesson_id: string }>(
    `SELECT lp.lesson_id
     FROM lesson_progress lp
     JOIN lessons l ON l.id = lp.lesson_id
     JOIN modules m ON m.id = l.module_id
     WHERE lp.student_id = $1 AND m.course_id = $2 AND lp.completed = true`,
    [studentId, courseId]
  );
  return new Set(rows.map((r) => r.lesson_id));
}

export async function setLessonProgress(
  studentId: string,
  lessonId: string,
  completed: boolean
): Promise<LessonProgress> {
  const row = await queryOne<LessonProgress>(
    `INSERT INTO lesson_progress (student_id, lesson_id, completed, completed_at)
     VALUES ($1, $2, $3, CASE WHEN $3 THEN now() ELSE NULL END)
     ON CONFLICT (student_id, lesson_id)
     DO UPDATE SET completed = $3, completed_at = CASE WHEN $3 THEN now() ELSE NULL END
     RETURNING *`,
    [studentId, lessonId, completed]
  );
  if (!row) throw new Error("Failed to update progress");
  return row;
}
