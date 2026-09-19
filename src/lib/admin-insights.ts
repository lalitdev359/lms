import { query } from "@/lib/db";
import { countUsersByRole, countNewUsersSince, listUsers } from "@/lib/repos/users";
import { categoryBreakdown, listAllCourses, listTopCoursesByEnrollment } from "@/lib/repos/courses";
import { countEnrollmentsSince } from "@/lib/repos/enrollments";

const DAY_MS = 24 * 60 * 60 * 1000;
const SIGNUP_WINDOW_DAYS = 14;

export interface ActivityItem {
  type: "signup" | "enrollment" | "completion" | "published";
  description: string;
  detail: string;
  at: string;
}

export interface AdminInsights {
  generatedAt: string;
  users: {
    total: number;
    STUDENT: number;
    INSTRUCTOR: number;
    ADMIN: number;
    newLast7Days: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
  };
  enrollments: {
    total: number;
    newLast7Days: number;
  };
  lessons: {
    total: number;
    completed: number;
    completionRate: number;
  };
  signupSeries: { date: string; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
  topCourses: {
    id: string;
    slug: string;
    title: string;
    instructorName: string;
    enrollmentCount: number;
    lessonCount: number;
  }[];
  recentActivity: ActivityItem[];
}

export async function getAdminInsights(): Promise<AdminInsights> {
  const sevenDaysAgo = new Date(Date.now() - 7 * DAY_MS);
  const seriesStart = new Date(Date.now() - (SIGNUP_WINDOW_DAYS - 1) * DAY_MS);
  seriesStart.setUTCHours(0, 0, 0, 0);

  const [
    userCounts,
    users,
    newUsers7d,
    courses,
    newEnrollments7d,
    categories,
    topCourses,
    signupRows,
    lessonCountRow,
    completionRow,
    recentSignups,
    recentEnrollments,
    recentCompletions,
    recentPublished,
  ] = await Promise.all([
    countUsersByRole(),
    listUsers(),
    countNewUsersSince(sevenDaysAgo),
    listAllCourses(),
    countEnrollmentsSince(sevenDaysAgo),
    categoryBreakdown(),
    listTopCoursesByEnrollment(5),
    query<{ day: string; count: string }>(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*)::text AS count
       FROM users
       WHERE created_at >= $1
       GROUP BY 1`,
      [seriesStart]
    ),
    query<{ total: string }>("SELECT COUNT(*)::text AS total FROM lessons"),
    query<{ done: string; possible: string }>(
      `SELECT
         COUNT(*) FILTER (WHERE lp.completed)::text AS done,
         COUNT(*)::text AS possible
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       JOIN modules m ON m.course_id = c.id
       JOIN lessons l ON l.module_id = m.id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = e.student_id`
    ),
    query<{ name: string; created_at: string }>(
      "SELECT name, created_at FROM users ORDER BY created_at DESC LIMIT 8"
    ),
    query<{ student_name: string; course_title: string; enrolled_at: string }>(
      `SELECT u.name AS student_name, c.title AS course_title, e.enrolled_at
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       ORDER BY e.enrolled_at DESC LIMIT 8`
    ),
    query<{ student_name: string; lesson_title: string; course_title: string; completed_at: string }>(
      `SELECT u.name AS student_name, l.title AS lesson_title, c.title AS course_title, lp.completed_at
       FROM lesson_progress lp
       JOIN users u ON u.id = lp.student_id
       JOIN lessons l ON l.id = lp.lesson_id
       JOIN modules m ON m.id = l.module_id
       JOIN courses c ON c.id = m.course_id
       WHERE lp.completed = true AND lp.completed_at IS NOT NULL
       ORDER BY lp.completed_at DESC LIMIT 8`
    ),
    query<{ title: string; instructor_name: string; published_at: string }>(
      `SELECT c.title, u.name AS instructor_name, c.published_at
       FROM courses c
       JOIN users u ON u.id = c.instructor_id
       WHERE c.published_at IS NOT NULL
       ORDER BY c.published_at DESC LIMIT 8`
    ),
  ]);

  const totalLessons = Number(lessonCountRow[0]?.total ?? 0);
  const completionStats = completionRow[0] ?? { done: "0", possible: "0" };
  const completedInstances = Number(completionStats.done);
  const possibleInstances = Number(completionStats.possible);

  const published = courses.filter((c) => c.published).length;

  const signupCounts = new Map(signupRows.map((r) => [r.day, Number(r.count)]));
  const signupSeries: { date: string; count: number }[] = [];
  for (let i = SIGNUP_WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    signupSeries.push({ date: key, count: signupCounts.get(key) ?? 0 });
  }

  const activity: ActivityItem[] = [
    ...recentSignups.map((r) => ({
      type: "signup" as const,
      description: `${r.name} joined`,
      detail: "New account",
      at: r.created_at,
    })),
    ...recentEnrollments.map((r) => ({
      type: "enrollment" as const,
      description: `${r.student_name} enrolled in ${r.course_title}`,
      detail: "New enrollment",
      at: r.enrolled_at,
    })),
    ...recentCompletions.map((r) => ({
      type: "completion" as const,
      description: `${r.student_name} completed "${r.lesson_title}"`,
      detail: r.course_title,
      at: r.completed_at,
    })),
    ...recentPublished.map((r) => ({
      type: "published" as const,
      description: `${r.instructor_name} published "${r.title}"`,
      detail: "Course published",
      at: r.published_at,
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 12);

  return {
    generatedAt: new Date().toISOString(),
    users: {
      total: users.length,
      STUDENT: userCounts.STUDENT,
      INSTRUCTOR: userCounts.INSTRUCTOR,
      ADMIN: userCounts.ADMIN,
      newLast7Days: newUsers7d,
    },
    courses: {
      total: courses.length,
      published,
      draft: courses.length - published,
    },
    enrollments: {
      total: courses.reduce((sum, c) => sum + c.enrollment_count, 0),
      newLast7Days: newEnrollments7d,
    },
    lessons: {
      total: totalLessons,
      completed: completedInstances,
      completionRate: possibleInstances ? Math.round((completedInstances / possibleInstances) * 100) : 0,
    },
    signupSeries,
    categoryBreakdown: categories,
    topCourses: topCourses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      instructorName: c.instructor_name,
      enrollmentCount: c.enrollment_count,
      lessonCount: c.lesson_count,
    })),
    recentActivity: activity,
  };
}
