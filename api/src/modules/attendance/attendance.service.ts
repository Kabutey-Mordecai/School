import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../common/http-errors.js";
import type { AttendanceRecord, AttendanceStatus } from "@prisma/client";

export type CreateAttendanceInput = {
  schoolId: string;
  studentId: string;
  classId: string;
  date: Date;
  subject?: string;
  status: AttendanceStatus;
  markedByUserId: string;
};

export async function listAttendance(
  schoolId: string,
  filters?: {
    studentId?: string;
    classId?: string;
    date?: Date;
    dateRange?: { from: Date; to: Date };
  },
) {
  return prisma.attendanceRecord.findMany({
    where: {
      schoolId,
      studentId: filters?.studentId,
      classId: filters?.classId,
      date: filters?.date
        ? { equals: filters.date }
        : filters?.dateRange
          ? { gte: filters.dateRange.from, lte: filters.dateRange.to }
          : undefined,
    },
    include: {
      student: true,
      class: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function getAttendanceById(
  recordId: string,
  schoolId: string,
): Promise<AttendanceRecord> {
  const record = await prisma.attendanceRecord.findUnique({
    where: { id: recordId },
  });

  if (!record || record.schoolId !== schoolId) {
    throw new HttpError("Attendance record not found", 404);
  }

  return record;
}

export async function createAttendance(
  input: CreateAttendanceInput,
): Promise<AttendanceRecord> {
  // Verify student exists and belongs to school
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

  // Prevent duplicate attendance records
  const existingRecord = await prisma.attendanceRecord.findFirst({
    where: {
      schoolId: input.schoolId,
      studentId: input.studentId,
      classId: input.classId,
      date: input.date,
      subject: input.subject || undefined,
    },
  });

  if (existingRecord) {
    throw new HttpError(
      "Attendance already recorded for this student and date",
      409,
    );
  }

  return prisma.attendanceRecord.create({
    data: {
      schoolId: input.schoolId,
      studentId: input.studentId,
      classId: input.classId,
      date: input.date,
      subject: input.subject,
      status: input.status,
      markedByUserId: input.markedByUserId,
    },
  });
}

export async function updateAttendance(
  recordId: string,
  schoolId: string,
  status: AttendanceStatus,
): Promise<AttendanceRecord> {
  const record = await getAttendanceById(recordId, schoolId);

  return prisma.attendanceRecord.update({
    where: { id: record.id },
    data: { status },
  });
}

export async function deleteAttendance(
  recordId: string,
  schoolId: string,
): Promise<AttendanceRecord> {
  const record = await getAttendanceById(recordId, schoolId);

  return prisma.attendanceRecord.delete({
    where: { id: record.id },
  });
}
