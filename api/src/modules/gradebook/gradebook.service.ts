import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../common/http-errors.js";
import type { GradeEntry } from "@prisma/client";

export type CreateGradeEntryInput = {
  schoolId: string;
  studentId: string;
  classId: string;
  term: string;
  subject: string;
  score: number;
  maxScore: number;
  createdByUserId: string;
};

export async function createGradeEntry(
  input: CreateGradeEntryInput,
): Promise<GradeEntry> {
  // Verify student exists
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
  });

  if (!student || student.schoolId !== input.schoolId) {
    throw new HttpError("Student not found", 404);
  }

  // Verify class exists
  const classRecord = await prisma.class.findUnique({
    where: { id: input.classId },
  });

  if (!classRecord || classRecord.schoolId !== input.schoolId) {
    throw new HttpError("Class not found", 404);
  }

  return prisma.gradeEntry.create({
    data: {
      schoolId: input.schoolId,
      studentId: input.studentId,
      classId: input.classId,
      term: input.term,
      subject: input.subject,
      score: input.score,
      maxScore: input.maxScore,
      createdByUserId: input.createdByUserId,
    },
  });
}

export async function getGradeReport(
  schoolId: string,
  studentId: string,
  term: string,
) {
  const grades = await prisma.gradeEntry.findMany({
    where: {
      schoolId,
      studentId,
      term,
    },
    orderBy: { subject: "asc" },
  });

  if (grades.length === 0) {
    throw new HttpError("No grades found for this student and term", 404);
  }

  // Calculate summary stats
  const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
  const totalPossible = grades.reduce((sum, g) => sum + g.maxScore, 0);
  const percentage = (totalScore / totalPossible) * 100;

  return {
    student: await prisma.student.findUnique({ where: { id: studentId } }),
    term,
    grades,
    summary: {
      totalScore,
      totalPossible,
      percentage: Math.round(percentage),
    },
  };
}

export async function listGradesByClass(
  schoolId: string,
  classId: string,
  term: string,
) {
  return prisma.gradeEntry.findMany({
    where: {
      schoolId,
      classId,
      term,
    },
    include: {
      student: true,
    },
    orderBy: [{ student: { firstName: "asc" } }, { subject: "asc" }],
  });
}

export async function updateGradeEntry(
  entryId: string,
  schoolId: string,
  score: number,
): Promise<GradeEntry> {
  const entry = await prisma.gradeEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry || entry.schoolId !== schoolId) {
    throw new HttpError("Grade entry not found", 404);
  }

  return prisma.gradeEntry.update({
    where: { id: entryId },
    data: { score },
  });
}

export async function deleteGradeEntry(
  entryId: string,
  schoolId: string,
): Promise<GradeEntry> {
  const entry = await prisma.gradeEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry || entry.schoolId !== schoolId) {
    throw new HttpError("Grade entry not found", 404);
  }

  return prisma.gradeEntry.delete({
    where: { id: entryId },
  });
}
