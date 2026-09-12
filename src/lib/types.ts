export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  title: string | null;
  avatar_hue: number;
  created_at: string;
}

export type PublicUser = Omit<User, "password_hash">;

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  level: Level;
  cover_hue: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  video_url: string | null;
  duration_minutes: number;
  position: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
}

export interface LessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface SessionPayload {
  sub: string;
  role: Role;
  name: string;
  email: string;
  [key: string]: unknown;
}
