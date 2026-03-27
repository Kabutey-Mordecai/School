import { z } from "zod";

export const createAttendanceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  classId: z.string().min(1, "Class ID is required"),
  date: z.coerce.date(),
  subject: z.string().optional(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
});

export const updateAttendanceSchema = z.object({
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
});

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
