import { z } from "zod";

export const createGradeEntrySchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  classId: z.string().min(1, "Class ID is required"),
  term: z.string().min(1, "Term is required"),
  subject: z.string().min(1, "Subject is required"),
  score: z.number().nonnegative("Score must be non-negative"),
  maxScore: z.number().positive("Max score must be positive"),
});

export const getGradeReportSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  term: z.string().min(1, "Term is required"),
});

export type CreateGradeEntryInput = z.infer<typeof createGradeEntrySchema>;
export type GetGradeReportInput = z.infer<typeof getGradeReportSchema>;
