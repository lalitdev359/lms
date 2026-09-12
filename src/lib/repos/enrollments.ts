import { query, queryOne } from "@/lib/db";
import type { Enrollment } from "@/lib/types";

export async function isEnrolled(studentId: string, courseId: string): Promise<boolean> {
  const row = await queryOne(
    "SELECT 1 FROM enrollments WHERE student_id = $1 AND course_id = $2",
    [studentId, courseId]
  );
  return row !== null;
}

export async function enrollStudent(studentId: string, courseId: string): Promise<Enrollment> {
  const row = await queryOne<Enrollment>(
    `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)
     ON CONFLICT (student_id, course_id) DO UPDATE SET student_id = EXCLUDED.student_id
     RETURNING *`,
    [studentId, courseId]
  );
  if (!row) throw new Error("Failed to enroll");
  return row;
}

export interface EnrolledCourseCard {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  level: string;
  cover_hue: number;
  instructor_name: string;
  enrolled_at: string;
  total_lessons: number;
  completed_lessons: number;
}

export async function listEnrollmentsForStudent(studentId: string): Promise<EnrolledCourseCard[]> {
  return query<EnrolledCourseCard>(
    `SELECT
       e.id,
       c.id AS course_id,
       c.title,
       c.slug,
       c.summary,
       c.category,
       c.level,
       c.cover_hue,
       u.name AS instructor_name,
       e.enrolled_at,
       COUNT(DISTINCT l.id)::int AS total_lessons,
       COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.completed)::int AS completed_lessons
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     JOIN users u ON u.id = c.instructor_id
     LEFT JOIN modules m ON m.course_id = c.id
     LEFT JOIN lessons l ON l.module_id = m.id
     LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = e.student_id
     WHERE e.student_id = $1
     GROUP BY e.id, c.id, u.name
     ORDER BY e.enrolled_at DESC`,
    [studentId]
  );
}

export interface RosterEntry {
  student_id: string;
  name: string;
  email: string;
  enrolled_at: string;
  total_lessons: number;
  completed_lessons: number;
}

export async function listRosterForCourse(courseId: string): Promise<RosterEntry[]> {
  return query<RosterEntry>(
    `SELECT
       e.student_id,
       u.name,
       u.email,
       e.enrolled_at,
       COUNT(DISTINCT l.id)::int AS total_lessons,
       COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.completed)::int AS completed_lessons
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id
     LEFT JOIN modules m ON m.course_id = c.id
     LEFT JOIN lessons l ON l.module_id = m.id
     LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = e.student_id
     WHERE e.course_id = $1
     GROUP BY e.student_id, u.name, u.email, e.enrolled_at
     ORDER BY e.enrolled_at DESC`,
    [courseId]
  );
}

export async function countEnrollmentsForInstructor(instructorId: string): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `SELECT COUNT(e.id)::text AS count
     FROM enrollments e JOIN courses c ON c.id = e.course_id
     WHERE c.instructor_id = $1`,
    [instructorId]
  );
  return Number(row?.count ?? 0);
}
