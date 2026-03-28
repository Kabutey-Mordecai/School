import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import useAuthStore from "../store/auth";

type DispatchLogItem = {
  id: string;
  channel: "SMS" | "WHATSAPP" | "PUSH" | "IN_APP";
  recipient: string;
  status: "QUEUED" | "SENT" | "FAILED";
  provider: "MOCK_SMS" | "MOCK_WHATSAPP" | "MOCK_PUSH" | "INTERNAL";
  message: string;
  createdAt: string;
};

type ProviderStatusItem = {
  channel: "SMS" | "WHATSAPP" | "PUSH" | "IN_APP";
  mode: "MOCK" | "LIVE";
  provider:
    | "MOCK_SMS"
    | "MOCK_WHATSAPP"
    | "MOCK_PUSH"
    | "INTERNAL"
    | "LIVE_SMS"
    | "LIVE_WHATSAPP"
    | "LIVE_PUSH";
  isReady: boolean;
};

type DeadLetterItem = {
  id: string;
  attempts: number;
  maxAttempts: number;
  lastError: string;
  updatedAt: string;
  payload: {
    channel: Channel;
    recipient: string;
    message: string;
  };
};

type Channel = "SMS" | "WHATSAPP" | "PUSH" | "IN_APP";

export function NotificationsPage() {
  const tokens = useAuthStore((s) => s.tokens);
  const [channel, setChannel] = useState<Channel>("SMS");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [bulkChannel, setBulkChannel] = useState<Channel>("SMS");
  const [bulkMessage, setBulkMessage] = useState("");
  const [recipientsText, setRecipientsText] = useState("");
  const [logItems, setLogItems] = useState<DispatchLogItem[]>([]);
  const [providerStatus, setProviderStatus] = useState<ProviderStatusItem[]>(
    [],
  );
  const [deadLetters, setDeadLetters] = useState<DeadLetterItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const authHeader = useMemo(
    () =>
      tokens
        ? {
            Authorization: `Bearer ${tokens.accessToken}`,
          }
        : undefined,
    [tokens],
  );

  async function loadDispatchLog() {
    if (!authHeader) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/v1/notifications/dispatch-log", {
        headers: authHeader,
      });
      setLogItems(response.data.items ?? []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load notification log");
    } finally {
      setLoading(false);
    }
  }

  async function loadProviderStatus() {
    if (!authHeader) {
      return;
    }

    try {
      const response = await axios.get(
        "/api/v1/notifications/providers/status",
        {
          headers: authHeader,
        },
      );
      setProviderStatus(response.data.items ?? []);
    } catch {
      setProviderStatus([]);
    }
  }

  async function loadDeadLetters() {
    if (!authHeader) {
      return;
    }

    try {
      const response = await axios.get("/api/v1/notifications/dead-letter", {
        headers: authHeader,
      });
      setDeadLetters(response.data.items ?? []);
    } catch {
      setDeadLetters([]);
    }
  }

  async function sendSingle(event: React.FormEvent) {
    event.preventDefault();
    if (!authHeader) {
      return;
    }

    setError(null);

    try {
      await axios.post(
        "/api/v1/notifications/send",
        {
          channel,
          recipient,
          message,
        },
        { headers: authHeader },
      );

      setRecipient("");
      setMessage("");
      await loadDispatchLog();
      await loadDeadLetters();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send notification");
    }
  }

  async function sendBulk(event: React.FormEvent) {
    event.preventDefault();
    if (!authHeader) {
      return;
    }

    const recipients = recipientsText
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (recipients.length === 0) {
      setError("Add at least one recipient for bulk send");
      return;
    }

    setError(null);

    try {
      await axios.post(
        "/api/v1/notifications/send-bulk",
        {
          channel: bulkChannel,
          recipients,
          message: bulkMessage,
        },
        { headers: authHeader },
      );

      setRecipientsText("");
      setBulkMessage("");
      await loadDispatchLog();
      await loadDeadLetters();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send bulk notification");
    }
  }

  async function retryDeadLetter(id: string) {
    if (!authHeader) {
      return;
    }

    try {
      await axios.post(
        `/api/v1/notifications/dead-letter/${id}/retry`,
        {},
        { headers: authHeader },
      );
      await loadDispatchLog();
      await loadDeadLetters();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to retry dead-letter item");
    }
  }

  useEffect(() => {
    loadDispatchLog();
    loadProviderStatus();
    loadDeadLetters();
  }, [tokens]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Notifications</h2>
      <p>
        Sprint 2 module: send notifications through SMS, WhatsApp, Push, and
        in-app channels.
      </p>

      {error ? (
        <div style={{ color: "#b00020", marginBottom: "12px" }}>{error}</div>
      ) : null}

      <section
        style={{
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "6px",
          marginBottom: "18px",
        }}
      >
        <h3>Provider Status</h3>
        {providerStatus.length === 0 ? (
          <p>No provider status available.</p>
        ) : null}
        {providerStatus.length > 0 ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "16px",
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>Channel</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Mode</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Provider</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Ready</th>
              </tr>
            </thead>
            <tbody>
              {providerStatus.map((item) => (
                <tr key={`${item.channel}_${item.provider}`}>
                  <td style={{ padding: "8px" }}>{item.channel}</td>
                  <td style={{ padding: "8px" }}>{item.mode}</td>
                  <td style={{ padding: "8px" }}>{item.provider}</td>
                  <td style={{ padding: "8px" }}>
                    {item.isReady ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "6px",
          marginBottom: "18px",
        }}
      >
        <h3>Dead-letter Queue</h3>
        {deadLetters.length === 0 ? (
          <p>No failed notifications queued.</p>
        ) : null}
        {deadLetters.length > 0 ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "16px",
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>Channel</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Recipient</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Attempts</th>
                <th style={{ textAlign: "left", padding: "8px" }}>
                  Last Error
                </th>
                <th style={{ textAlign: "left", padding: "8px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {deadLetters.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: "8px" }}>{item.payload.channel}</td>
                  <td style={{ padding: "8px" }}>{item.payload.recipient}</td>
                  <td style={{ padding: "8px" }}>
                    {item.attempts} / {item.maxAttempts}
                  </td>
                  <td style={{ padding: "8px" }}>{item.lastError}</td>
                  <td style={{ padding: "8px" }}>
                    <button
                      type="button"
                      onClick={() => retryDeadLetter(item.id)}
                      disabled={item.attempts >= item.maxAttempts}
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "6px",
          marginBottom: "18px",
        }}
      >
        <h3>Send Single Notification</h3>
        <form
          onSubmit={sendSingle}
          style={{ display: "grid", gap: "10px", maxWidth: "520px" }}
        >
          <label>
            Channel
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as Channel)}
            >
              <option value="SMS">SMS</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="PUSH">Push</option>
              <option value="IN_APP">In-App</option>
            </select>
          </label>

          <input
            placeholder="Recipient (phone, user id, or topic)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />

          <textarea
            placeholder="Notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          />

          <button type="submit">Send Notification</button>
        </form>
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "6px",
          marginBottom: "18px",
        }}
      >
        <h3>Send Bulk Notification</h3>
        <form
          onSubmit={sendBulk}
          style={{ display: "grid", gap: "10px", maxWidth: "520px" }}
        >
          <label>
            Channel
            <select
              value={bulkChannel}
              onChange={(e) => setBulkChannel(e.target.value as Channel)}
            >
              <option value="SMS">SMS</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="PUSH">Push</option>
              <option value="IN_APP">In-App</option>
            </select>
          </label>

          <label>
            Recipients (one per line)
            <textarea
              value={recipientsText}
              onChange={(e) => setRecipientsText(e.target.value)}
              rows={5}
              placeholder={"+233500000001\n+233500000002"}
              required
            />
          </label>

          <textarea
            placeholder="Notification message"
            value={bulkMessage}
            onChange={(e) => setBulkMessage(e.target.value)}
            rows={4}
            required
          />

          <button type="submit">Send Bulk</button>
        </form>
      </section>

      <section
        style={{
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "6px",
        }}
      >
        <h3>Dispatch Log</h3>
        {loading ? <p>Loading...</p> : null}
        {!loading && logItems.length === 0 ? (
          <p>No notifications sent yet.</p>
        ) : null}
        {!loading && logItems.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>Channel</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Recipient</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Provider</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {logItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: "8px" }}>{item.channel}</td>
                  <td style={{ padding: "8px" }}>{item.recipient}</td>
                  <td style={{ padding: "8px" }}>{item.provider}</td>
                  <td style={{ padding: "8px" }}>{item.status}</td>
                  <td style={{ padding: "8px" }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </div>
  );
}
