import { Router } from "express";
import { requireAuth, requireRole } from "../../common/auth-middleware.js";
import {
  listAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "./attendance.service.js";
import {
  createAttendanceSchema,
  updateAttendanceSchema,
} from "./attendance.schemas.js";

export const attendanceRouter = Router();

attendanceRouter.get(
  "/",
  requireAuth,
  requireRole(["ADMIN", "TEACHER"]),
  async (req, res, next) => {
    try {
      const { studentId, classId, date } = req.query;
      const attendance = await listAttendance(req.auth!.schoolId, {
        studentId: studentId as string | undefined,
        classId: classId as string | undefined,
        date: date ? new Date(date as string) : undefined,
      });
      res.status(200).json({ items: attendance });
    } catch (error) {
      next(error);
    }
  },
);

attendanceRouter.get(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "TEACHER"]),
  async (req, res, next) => {
    try {
      const record = await getAttendanceById(req.params.id, req.auth!.schoolId);
      res.status(200).json(record);
    } catch (error) {
      next(error);
    }
  },
);

attendanceRouter.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "TEACHER"]),
  async (req, res, next) => {
    try {
      const input = createAttendanceSchema.parse(req.body);
      const record = await createAttendance({
        ...input,
        schoolId: req.auth!.schoolId,
        markedByUserId: req.auth!.sub,
      });
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  },
);

attendanceRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "TEACHER"]),
  async (req, res, next) => {
    try {
      const input = updateAttendanceSchema.parse(req.body);
      const record = await updateAttendance(
        req.params.id,
        req.auth!.schoolId,
        input.status,
      );
      res.status(200).json(record);
    } catch (error) {
      next(error);
    }
  },
);

attendanceRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "TEACHER"]),
  async (req, res, next) => {
    try {
      const record = await deleteAttendance(req.params.id, req.auth!.schoolId);
      res.status(200).json(record);
    } catch (error) {
      next(error);
    }
  },
);
