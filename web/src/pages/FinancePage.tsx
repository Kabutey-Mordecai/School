import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import useAuthStore from "../store/auth";

type Invoice = {
  id: string;
  invoiceNumber: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
  totalAmount: string;
  status: "DRAFT" | "ISSUED" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";
};

type PaymentMethod = "CASH" | "BANK_TRANSFER" | "MTN_MOMO" | "VODAFONE_CASH";

export function FinancePage() {
  const tokens = useAuthStore((s) => s.tokens);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studentId, setStudentId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  const authHeader = useMemo(() => {
    return tokens
      ? { Authorization: `Bearer ${tokens.accessToken}` }
      : undefined;
  }, [tokens]);

  async function loadInvoices() {
    if (!authHeader) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/v1/finance/invoices", {
        headers: authHeader,
      });
      setInvoices(response.data.items ?? []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }

  async function submitInvoice(event: React.FormEvent) {
    event.preventDefault();
    if (!authHeader) {
      return;
    }

    setError(null);
    try {
      await axios.post(
        "/api/v1/finance/invoices",
        {
          studentId,
          invoiceNumber,
          issueDate,
          dueDate,
          totalAmount: Number(totalAmount),
        },
        { headers: authHeader },
      );

      setStudentId("");
      setInvoiceNumber("");
      setIssueDate("");
      setDueDate("");
      setTotalAmount("");

      await loadInvoices();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create invoice");
    }
  }

  async function submitPayment(event: React.FormEvent) {
    event.preventDefault();
    if (!authHeader || !selectedInvoiceId) {
      return;
    }

    setError(null);
    try {
      await axios.post(
        `/api/v1/finance/invoices/${selectedInvoiceId}/payments`,
        {
          amount: Number(paymentAmount),
          method: paymentMethod,
        },
        { headers: authHeader },
      );

      setSelectedInvoiceId("");
      setPaymentAmount("");
      setPaymentMethod("CASH");

      await loadInvoices();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to record payment");
    }
  }

  useEffect(() => {
    loadInvoices();
  }, [tokens]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Finance</h2>
      <p>Sprint 2 module: invoice management and payment recording.</p>

      {error ? (
        <div style={{ color: "#b00020", marginBottom: "12px" }}>{error}</div>
      ) : null}

      <section
        style={{
          marginBottom: "24px",
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "6px",
        }}
      >
        <h3>Create Invoice</h3>
        <form
          onSubmit={submitInvoice}
          style={{ display: "grid", gap: "10px", maxWidth: "520px" }}
        >
          <input
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />
          <input
            placeholder="Invoice Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
          />
          <label>
            Issue Date
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
            />
          </label>
          <label>
            Due Date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </label>
          <input
            placeholder="Total Amount"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            type="number"
            min="0.01"
            step="0.01"
            required
          />
          <button type="submit">Create Invoice</button>
        </form>
      </section>

      <section
        style={{
          marginBottom: "24px",
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "6px",
        }}
      >
        <h3>Record Payment</h3>
        <form
          onSubmit={submitPayment}
          style={{ display: "grid", gap: "10px", maxWidth: "520px" }}
        >
          <select
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(e.target.value)}
            required
          >
            <option value="">Select invoice</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber} - {invoice.status}
              </option>
            ))}
          </select>
          <input
            placeholder="Payment Amount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            type="number"
            min="0.01"
            step="0.01"
            required
          />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="MTN_MOMO">MTN MoMo</option>
            <option value="VODAFONE_CASH">Vodafone Cash</option>
          </select>
          <button type="submit">Record Payment</button>
        </form>
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "6px",
        }}
      >
        <h3>Invoices</h3>
        {loading ? <p>Loading...</p> : null}
        {!loading && invoices.length === 0 ? <p>No invoices yet.</p> : null}
        {!loading && invoices.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>Invoice</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Student</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Due Date</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Amount</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td style={{ padding: "8px" }}>{invoice.invoiceNumber}</td>
                  <td style={{ padding: "8px" }}>{invoice.studentId}</td>
                  <td style={{ padding: "8px" }}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "8px" }}>{invoice.totalAmount}</td>
                  <td style={{ padding: "8px" }}>{invoice.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </div>
  );
}
