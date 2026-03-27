import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../common/http-errors.js";
import type { Student } from "@prisma/client";

export type CreateStudentInput = {
  schoolId: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  dateOfBirth?: Date;
};

export type UpdateStudentInput = Partial<
  Omit<CreateStudentInput, "schoolId" | "studentCode">
>;

export async function listStudents(
  schoolId: string,
  filters?: {
    isActive?: boolean;
    classId?: string;
  },
) {
  return prisma.student.findMany({
    where: {
      schoolId,
      isActive: filters?.isActive,
    },
    include: {
      enrollments: {
        where: filters?.classId ? { classId: filters.classId } : undefined,
      },
    },
    orderBy: { firstName: "asc" },
  });
}

export async function getStudentById(
  studentId: string,
  schoolId: string,
): Promise<Student> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student || student.schoolId !== schoolId) {
    throw new HttpError("Student not found", 404);
  }

  return student;
}

export async function createStudent(
  input: CreateStudentInput,
): Promise<Student> {
  const existingStudent = await prisma.student.findUnique({
    where: {
      schoolId_studentCode: {
        schoolId: input.schoolId,
        studentCode: input.studentCode,
      },
    },
  });

  if (existingStudent) {
    throw new HttpError("Student code already exists", 409);
  }

  return prisma.student.create({
    data: {
      schoolId: input.schoolId,
      firstName: input.firstName,
      lastName: input.lastName,
      studentCode: input.studentCode,
      dateOfBirth: input.dateOfBirth,
      enrollmentDate: new Date(),
    },
  });
}

export async function updateStudent(
  studentId: string,
  schoolId: string,
  input: UpdateStudentInput,
): Promise<Student> {
  const student = await getStudentById(studentId, schoolId);

  return prisma.student.update({
    where: { id: student.id },
    data: {
      firstName: input.firstName ?? student.firstName,
      lastName: input.lastName ?? student.lastName,
      dateOfBirth: input.dateOfBirth ?? student.dateOfBirth,
    },
  });
}

export async function deactivateStudent(
  studentId: string,
  schoolId: string,
): Promise<Student> {
  const student = await getStudentById(studentId, schoolId);

  return prisma.student.update({
    where: { id: student.id },
    data: { isActive: false },
  });
}
