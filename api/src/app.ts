import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./common/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { studentsRouter } from "./modules/students/students.routes.js";
import { attendanceRouter } from "./modules/attendance/attendance.routes.js";
import { gradebookRouter } from "./modules/gradebook/gradebook.routes.js";
import { financeRouter } from "./modules/finance/finance.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "educore-api" });
});

app.get("/api/v1", (_req, res) => {
  res.status(200).json({
    message: "EduCore API bootstrap",
    modules: [
      "auth",
      "students",
      "attendance",
      "gradebook",
      "finance",
      "notifications",
    ],
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/students", studentsRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/gradebook", gradebookRouter);
app.use("/api/v1/finance", financeRouter);
app.use("/api/v1/notifications", notificationsRouter);

app.use(errorHandler);

export default app;
