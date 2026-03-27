import { InvoiceStatus, type Invoice, type Payment } from "@prisma/client";
import { HttpError } from "../../common/http-errors.js";
import { prisma } from "../../db/prisma.js";

export type CreateInvoiceInput = {
  schoolId: string;
  studentId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  totalAmount: number;
};

export type RecordPaymentInput = {
  schoolId: string;
  invoiceId: string;
  amount: number;
  method: "CASH" | "BANK_TRANSFER" | "MTN_MOMO" | "VODAFONE_CASH";
  providerRef?: string;
  paidAt?: Date;
};

function toNumber(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : Number(value.toString());
}

function resolveInvoiceStatus(
  totalAmount: number,
  paidAmount: number,
): InvoiceStatus {
  if (paidAmount <= 0) {
    return InvoiceStatus.ISSUED;
  }

  if (paidAmount >= totalAmount) {
    return InvoiceStatus.PAID;
  }

  return InvoiceStatus.PARTIAL;
}

export async function listInvoices(
  schoolId: string,
  filters?: {
    studentId?: string;
    status?: InvoiceStatus;
  },
) {
  return prisma.invoice.findMany({
    where: {
      schoolId,
      studentId: filters?.studentId,
      status: filters?.status,
    },
    include: {
      student: true,
      payments: true,
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
}

export async function getInvoiceById(invoiceId: string, schoolId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { student: true, payments: true },
  });

  if (!invoice || invoice.schoolId !== schoolId) {
    throw new HttpError("Invoice not found", 404);
  }

  return invoice;
}

export async function createInvoice(
  input: CreateInvoiceInput,
): Promise<Invoice> {
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
  });

  if (!student || student.schoolId !== input.schoolId) {
    throw new HttpError("Student not found", 404);
  }

  const existing = await prisma.invoice.findUnique({
    where: {
      schoolId_invoiceNumber: {
        schoolId: input.schoolId,
        invoiceNumber: input.invoiceNumber,
      },
    },
  });

  if (existing) {
    throw new HttpError("Invoice number already exists", 409);
  }

  return prisma.invoice.create({
    data: {
      schoolId: input.schoolId,
      studentId: input.studentId,
      invoiceNumber: input.invoiceNumber,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      totalAmount: input.totalAmount,
      status: InvoiceStatus.ISSUED,
    },
  });
}

export async function recordPayment(
  input: RecordPaymentInput,
): Promise<Payment> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: input.invoiceId },
    include: { payments: true },
  });

  if (!invoice || invoice.schoolId !== input.schoolId) {
    throw new HttpError("Invoice not found", 404);
  }

  const totalAmount = toNumber(invoice.totalAmount);
  const paidAmount = invoice.payments.reduce(
    (sum, p) => sum + toNumber(p.amount),
    0,
  );
  const outstanding = totalAmount - paidAmount;

  if (input.amount > outstanding) {
    throw new HttpError("Payment amount exceeds outstanding balance", 409);
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        schoolId: input.schoolId,
        invoiceId: input.invoiceId,
        amount: input.amount,
        method: input.method,
        providerRef: input.providerRef,
        paidAt: input.paidAt ?? new Date(),
      },
    });

    const newPaidAmount = paidAmount + input.amount;
    const status = resolveInvoiceStatus(totalAmount, newPaidAmount);

    await tx.invoice.update({
      where: { id: input.invoiceId },
      data: { status },
    });

    return payment;
  });

  return result;
}
