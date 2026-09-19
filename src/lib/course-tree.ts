import { getCourseById, getCourseBySlug, type CourseCard } from "@/lib/repos/courses";
import { listModulesByCourse } from "@/lib/repos/modules";
import { listLessonsByModule } from "@/lib/repos/lessons";
import { getCompletedLessonIds } from "@/lib/repos/progress";
import type { CourseModule, Lesson } from "@/lib/types";

export interface LessonWithProgress extends Lesson {
  completed: boolean;
}

export interface ModuleWithLessons extends CourseModule {
  lessons: LessonWithProgress[];
}

export interface CourseTree extends CourseCard {
  modules: ModuleWithLessons[];
}

async function buildTree(course: CourseCard, studentId?: string): Promise<CourseTree> {
  const modules = await listModulesByCourse(course.id);
  const completed = studentId ? await getCompletedLessonIds(studentId, course.id) : new Set<string>();

  const modulesWithLessons: ModuleWithLessons[] = await Promise.all(
    modules.map(async (module) => {
      const lessons = await listLessonsByModule(module.id);
      return {
        ...module,
        lessons: lessons.map((lesson) => ({ ...lesson, completed: completed.has(lesson.id) })),
      };
    })
  );

  return { ...course, modules: modulesWithLessons };
}

/** Loads a course with its full module/lesson tree, optionally marking a
 * student's completed lessons. */
export async function getCourseTree(courseId: string, studentId?: string): Promise<CourseTree | null> {
  const course = await getCourseById(courseId);
  if (!course) return null;
  return buildTree(course, studentId);
}

/** Same as getCourseTree, but looked up by the course's public slug — used
 * on the student-facing course detail and lesson pages, which route by
 * slug rather than the internal UUID. */
export async function getCourseTreeBySlug(slug: string, studentId?: string): Promise<CourseTree | null> {
  const course = await getCourseBySlug(slug);
  if (!course) return null;
  return buildTree(course, studentId);
}
