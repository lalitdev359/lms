import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  role: z.enum(["STUDENT", "INSTRUCTOR"]),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]),
});

export const courseSchema = z.object({
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().max(200).default(""),
  description: z.string().trim().max(4000).default(""),
  category: z.string().trim().min(1).max(60),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

export const moduleSchema = z.object({
  title: z.string().trim().min(2).max(120),
});

export const lessonSchema = z.object({
  title: z.string().trim().min(2).max(160),
  content: z.string().trim().max(8000).default(""),
  videoUrl: z.string().trim().url().optional().or(z.literal("")),
  durationMinutes: z.coerce.number().int().min(1).max(600).default(10),
});
