import { Router } from "express";
import { requireAuth, requireRole } from "../../common/auth-middleware.js";
import {
  createInvoiceSchema,
  listInvoicesQuerySchema,
  recordPaymentSchema,
} from "./finance.schemas.js";
import {
  createInvoice,
  getInvoiceById,
  listInvoices,
  recordPayment,
} from "./finance.service.js";

export const financeRouter = Router();

financeRouter.get(
  "/invoices",
  requireAuth,
  requireRole(["ADMIN", "ACCOUNTANT"]),
  async (req, res, next) => {
    try {
      const query = listInvoicesQuerySchema.parse(req.query);
      const invoices = await listInvoices(req.auth!.schoolId, {
        studentId: query.studentId,
        status: query.status,
      });
      res.status(200).json({ items: invoices });
    } catch (error) {
      next(error);
    }
  },
);

financeRouter.get(
  "/invoices/:id",
  requireAuth,
  requireRole(["ADMIN", "ACCOUNTANT", "PARENT"]),
  async (req, res, next) => {
    try {
      const invoice = await getInvoiceById(req.params.id, req.auth!.schoolId);
      res.status(200).json(invoice);
    } catch (error) {
      next(error);
    }
  },
);

financeRouter.post(
  "/invoices",
  requireAuth,
  requireRole(["ADMIN", "ACCOUNTANT"]),
  async (req, res, next) => {
    try {
      const input = createInvoiceSchema.parse(req.body);
      const invoice = await createInvoice({
        schoolId: req.auth!.schoolId,
        studentId: input.studentId,
        invoiceNumber: input.invoiceNumber,
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        totalAmount: input.totalAmount,
      });
      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  },
);

financeRouter.post(
  "/invoices/:id/payments",
  requireAuth,
  requireRole(["ADMIN", "ACCOUNTANT", "PARENT"]),
  async (req, res, next) => {
    try {
      const input = recordPaymentSchema.parse(req.body);
      const payment = await recordPayment({
        schoolId: req.auth!.schoolId,
        invoiceId: req.params.id,
        amount: input.amount,
        method: input.method,
        providerRef: input.providerRef,
        paidAt: input.paidAt,
      });
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  },
);
