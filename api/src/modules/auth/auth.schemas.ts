import { z } from "zod";

export const registerSchema = z.object({
  schoolId: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["ADMIN", "TEACHER", "PARENT", "STUDENT", "ACCOUNTANT"]),
});

export const loginSchema = z
  .object({
    schoolId: z.string().min(1).optional(),
    schoolCode: z.string().min(1).optional(),
    email: z.string().email(),
    password: z.string().min(8),
  })
  .refine((data) => Boolean(data.schoolId || data.schoolCode), {
    message: "schoolId or schoolCode is required",
    path: ["schoolId"],
  });

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
