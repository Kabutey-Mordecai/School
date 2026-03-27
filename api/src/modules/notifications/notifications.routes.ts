import { Router } from "express";
import { requireAuth, requireRole } from "../../common/auth-middleware.js";
import {
  retryDeadLetterSchema,
  sendBulkNotificationSchema,
  sendNotificationSchema,
} from "./notifications.schemas.js";
import {
  getNotificationDeadLetters,
  getNotificationDispatchLog,
  getNotificationProviderStatus,
  retryDeadLetterNotification,
  sendBulkNotifications,
  sendNotification,
} from "./notifications.service.js";

export const notificationsRouter = Router();

notificationsRouter.get(
  "/providers/status",
  requireAuth,
  requireRole(["ADMIN", "ACCOUNTANT"]),
  async (_req, res, next) => {
    try {
      const items = await getNotificationProviderStatus();
      res.status(200).json({ items });
    } catch (error) {
      next(error);
    }
  },
);

notificationsRouter.get(
  "/dispatch-log",
  requireAuth,
  requireRole(["ADMIN", "TEACHER", "ACCOUNTANT"]),
  async (req, res, next) => {
    try {
      const items = await getNotificationDispatchLog(req.auth!.schoolId);
      res.status(200).json({ items });
    } catch (error) {
      next(error);
    }
  },
);

notificationsRouter.get(
  "/dead-letter",
  requireAuth,
  requireRole(["ADMIN", "TEACHER", "ACCOUNTANT"]),
  async (req, res, next) => {
    try {
      const items = await getNotificationDeadLetters(req.auth!.schoolId);
      res.status(200).json({ items });
    } catch (error) {
      next(error);
    }
  },
);

notificationsRouter.post(
  "/dead-letter/:id/retry",
  requireAuth,
  requireRole(["ADMIN", "TEACHER", "ACCOUNTANT"]),
  async (req, res, next) => {
    try {
      const { id } = retryDeadLetterSchema.parse(req.params);
      const result = await retryDeadLetterNotification(id, req.auth!.schoolId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
);

notificationsRouter.post(
  "/send",
  requireAuth,
  requireRole(["ADMIN", "TEACHER", "ACCOUNTANT"]),
  async (req, res, next) => {
    try {
      const input = sendNotificationSchema.parse(req.body);
      const result = await sendNotification({
        schoolId: req.auth!.schoolId,
        channel: input.channel,
        recipient: input.recipient,
        message: input.message,
        subject: input.subject,
        metadata: input.metadata,
        requestedByUserId: req.auth!.sub,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

notificationsRouter.post(
  "/send-bulk",
  requireAuth,
  requireRole(["ADMIN", "TEACHER", "ACCOUNTANT"]),
  async (req, res, next) => {
    try {
      const input = sendBulkNotificationSchema.parse(req.body);
      const result = await sendBulkNotifications({
        schoolId: req.auth!.schoolId,
        channel: input.channel,
        recipients: input.recipients,
        message: input.message,
        subject: input.subject,
        metadata: input.metadata,
        requestedByUserId: req.auth!.sub,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);
