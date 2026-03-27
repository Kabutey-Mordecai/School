import { z } from "zod";

export const createInvoiceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  totalAmount: z.coerce.number().positive("Total amount must be positive"),
});

export const listInvoicesQuerySchema = z.object({
  studentId: z.string().optional(),
  status: z
    .enum(["DRAFT", "ISSUED", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"])
    .optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive("Payment amount must be positive"),
  method: z.enum(["CASH", "BANK_TRANSFER", "MTN_MOMO", "VODAFONE_CASH"]),
  providerRef: z.string().optional(),
  paidAt: z.coerce.date().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type ListInvoicesQueryInput = z.infer<typeof listInvoicesQuerySchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
