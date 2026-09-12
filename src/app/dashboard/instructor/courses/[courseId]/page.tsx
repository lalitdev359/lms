import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getCourseTree } from "@/lib/course-tree";
import { listRosterForCourse } from "@/lib/repos/enrollments";
import { CourseManager } from "@/components/dashboard/CourseManager";

export default async function ManageCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const course = await getCourseTree(courseId);
  if (!course) notFound();

  if (session.role !== "ADMIN" && course.instructor_id !== session.sub) {
    redirect("/dashboard/instructor");
  }

  const roster = await listRosterForCourse(courseId);

  return <CourseManager course={course} roster={roster} />;
}
