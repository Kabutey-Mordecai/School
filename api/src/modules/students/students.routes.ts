import { Router } from "express";
import { requireAuth, requireRole } from "../../common/auth-middleware.js";
import {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deactivateStudent,
} from "./students.service.js";
import {
  createStudentSchema,
  updateStudentSchema,
} from "./students.schemas.js";

export const studentsRouter = Router();

studentsRouter.get(
  "/",
  requireAuth,
  requireRole(["ADMIN", "TEACHER"]),
  async (req, res, next) => {
    try {
      const { isActive, classId } = req.query;
      const students = await listStudents(req.auth!.schoolId, {
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
        classId: classId as string | undefined,
      });
      res.status(200).json({ items: students });
    } catch (error) {
      next(error);
    }
  },
);

studentsRouter.get(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "TEACHER", "PARENT"]),
  async (req, res, next) => {
    try {
      const student = await getStudentById(req.params.id, req.auth!.schoolId);
      res.status(200).json(student);
    } catch (error) {
      next(error);
    }
  },
);

studentsRouter.post(
  "/",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      const input = createStudentSchema.parse(req.body);
      const student = await createStudent({
        ...input,
        schoolId: req.auth!.schoolId,
      });
      res.status(201).json(student);
    } catch (error) {
      next(error);
    }
  },
);

studentsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      const input = updateStudentSchema.parse(req.body);
      const student = await updateStudent(
        req.params.id,
        req.auth!.schoolId,
        input,
      );
      res.status(200).json(student);
    } catch (error) {
      next(error);
    }
  },
);

studentsRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res, next) => {
    try {
      const student = await deactivateStudent(
        req.params.id,
        req.auth!.schoolId,
      );
      res.status(200).json(student);
    } catch (error) {
      next(error);
    }
  },
);
