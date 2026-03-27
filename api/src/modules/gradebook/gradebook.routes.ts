import { Router } from "express";
import { requireAuth, requireRole } from "../../common/auth-middleware.js";
import {
  createGradeEntry,
  getGradeReport,
  listGradesByClass,
  updateGradeEntry,
  deleteGradeEntry,
} from "./gradebook.service.js";
import {
  createGradeEntrySchema,
  getGradeReportSchema,
} from "./gradebook.schemas.js";

export const gradebookRouter = Router();

gradebookRouter.post(
  "/grades",
  requireAuth,
  requireRole(["ADMIN", "TEACHER"]),
  async (req, res, next) => {
    try {
      const input = createGradeEntrySchema.parse(req.body);
      const entry = await createGradeEntry({
        ...input,
        schoolId: req.auth!.schoolId,
        createdByUserId: req.auth!.sub,
      });
      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  },
);

gradebookRouter.get(
  "/grades/class/:classId/:term",
  requireAuth,
  requireRole(["ADMIN", "TEACHER"]),
  async (req, res, next) => {
    try {
      const grades = await listGradesByClass(
        req.auth!.schoolId,
        req.params.classId,
        req.params.term,
      );
      res.status(200).json({ items: grades });
    } catch (error) {
      next(error);
    }
  },
);

gradebookRouter.get(
  "/report/:studentId/:term",
  requireAuth,
  requireRole(["ADMIN", "TEACHER", "PARENT"]),
  async (req, res, next) => {
    try {
      const report = await getGradeReport(
        req.auth!.schoolId,
        req.params.studentId,
        req.params.term,
      );
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  },
);

gradebookRouter.patch(
  "/grades/:id",
  requireAuth,
  requireRole(["ADMIN", "TEACHER"]),
  async (req, res, next) => {
    try {
      const { score } = req.body;
      if (typeof score !== "number") {
        throw new Error("Score must be a number");
      }
      const entry = await updateGradeEntry(
        req.params.id,
        req.auth!.schoolId,
        score,
      );
      res.status(200).json(entry);
    } catch (error) {
      next(error);
    }
  },
);

gradebookRouter.delete(
  "/grades/:id",
  requireAuth,
  requireRole(["ADMIN", "TEACHER"]),
  async (req, res, next) => {
    try {
      const entry = await deleteGradeEntry(req.params.id, req.auth!.schoolId);
      res.status(200).json(entry);
    } catch (error) {
      next(error);
    }
  },
);
