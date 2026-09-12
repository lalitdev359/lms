import { getCourseById, type CourseCard } from "@/lib/repos/courses";
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

/** Loads a course with its full module/lesson tree, optionally marking a
 * student's completed lessons. */
export async function getCourseTree(courseId: string, studentId?: string): Promise<CourseTree | null> {
  const course = await getCourseById(courseId);
  if (!course) return null;

  const modules = await listModulesByCourse(courseId);
  const completed = studentId ? await getCompletedLessonIds(studentId, courseId) : new Set<string>();

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
