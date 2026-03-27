import crypto from "node:crypto";
import {
  getProviderAdapter,
  getProviderStatus,
} from "./notifications.providers.js";
import { HttpError } from "../../common/http-errors.js";

export type NotificationChannel = "SMS" | "WHATSAPP" | "PUSH" | "IN_APP";

export type NotificationRequest = {
  schoolId: string;
  channel: NotificationChannel;
  recipient: string;
  message: string;
  subject?: string;
  metadata?: Record<string, string>;
  requestedByUserId: string;
};

export type NotificationDispatchResult = {
  id: string;
  schoolId: string;
  channel: NotificationChannel;
  recipient: string;
  status: "QUEUED" | "SENT" | "FAILED";
  provider:
    | "MOCK_SMS"
    | "MOCK_WHATSAPP"
    | "MOCK_PUSH"
    | "INTERNAL"
    | "LIVE_SMS"
    | "LIVE_WHATSAPP"
    | "LIVE_PUSH";
  providerMessageId: string;
  message: string;
  error?: string;
  createdAt: string;
};

type DeadLetterItem = {
  id: string;
  schoolId: string;
  payload: NotificationRequest;
  attempts: number;
  maxAttempts: number;
  lastError: string;
  createdAt: string;
  updatedAt: string;
};

const inMemoryDispatchLog: NotificationDispatchResult[] = [];
const inMemoryDeadLetterQueue: DeadLetterItem[] = [];

function pushLog(result: NotificationDispatchResult) {
  inMemoryDispatchLog.unshift(result);
  if (inMemoryDispatchLog.length > 200) {
    inMemoryDispatchLog.length = 200;
  }
}

function createDispatchResult(
  payload: NotificationRequest,
  provider: NotificationDispatchResult["provider"],
  status: NotificationDispatchResult["status"],
  providerMessageId: string,
  error?: string,
): NotificationDispatchResult {
  return {
    id: crypto.randomUUID(),
    schoolId: payload.schoolId,
    channel: payload.channel,
    recipient: payload.recipient,
    status,
    provider,
    providerMessageId,
    message: payload.message,
    error,
    createdAt: new Date().toISOString(),
  };
}

async function dispatchViaProvider(
  payload: NotificationRequest,
): Promise<NotificationDispatchResult> {
  const adapter = getProviderAdapter(payload.channel);
  const providerResult = await adapter.send({
    recipient: payload.recipient,
    message: payload.message,
    subject: payload.subject,
    metadata: payload.metadata,
  });

  return createDispatchResult(
    payload,
    adapter.providerName,
    providerResult.status,
    providerResult.providerMessageId ?? `msg_${crypto.randomUUID()}`,
    providerResult.error,
  );
}

function pushDeadLetter(
  payload: NotificationRequest,
  error: string,
): DeadLetterItem {
  const item: DeadLetterItem = {
    id: crypto.randomUUID(),
    schoolId: payload.schoolId,
    payload,
    attempts: 1,
    maxAttempts: 5,
    lastError: error,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryDeadLetterQueue.unshift(item);
  if (inMemoryDeadLetterQueue.length > 200) {
    inMemoryDeadLetterQueue.length = 200;
  }

  return item;
}

export async function sendNotification(
  payload: NotificationRequest,
): Promise<NotificationDispatchResult> {
  const result = await dispatchViaProvider(payload);
  pushLog(result);

  if (result.status === "FAILED") {
    pushDeadLetter(payload, result.error ?? "Unknown provider failure");
  }

  return result;
}

export async function sendBulkNotifications(
  payload: Omit<NotificationRequest, "recipient"> & { recipients: string[] },
): Promise<{
  accepted: number;
  failed: number;
  results: NotificationDispatchResult[];
}> {
  const results: NotificationDispatchResult[] = [];

  for (const recipient of payload.recipients) {
    const result = await dispatchViaProvider({
      ...payload,
      recipient,
    });
    results.push(result);
  }

  for (const result of results) {
    pushLog(result);

    if (result.status === "FAILED") {
      const failedPayload = payload.recipients
        .map((recipient) => ({ ...payload, recipient }))
        .find((item) => item.recipient === result.recipient);

      if (failedPayload) {
        pushDeadLetter(
          failedPayload,
          result.error ?? "Unknown provider failure",
        );
      }
    }
  }

  return {
    accepted: results.filter((r) => r.status === "SENT").length,
    failed: results.filter((r) => r.status === "FAILED").length,
    results,
  };
}

export async function getNotificationDispatchLog(schoolId: string) {
  return inMemoryDispatchLog.filter((entry) => entry.schoolId === schoolId);
}

export async function getNotificationProviderStatus() {
  return getProviderStatus();
}

export async function getNotificationDeadLetters(schoolId: string) {
  return inMemoryDeadLetterQueue.filter((item) => item.schoolId === schoolId);
}

export async function retryDeadLetterNotification(
  id: string,
  schoolId: string,
) {
  const item = inMemoryDeadLetterQueue.find((entry) => entry.id === id);

  if (!item || item.schoolId !== schoolId) {
    throw new HttpError("Dead-letter entry not found", 404);
  }

  if (item.attempts >= item.maxAttempts) {
    throw new HttpError("Max retry attempts reached", 409);
  }

  const result = await dispatchViaProvider(item.payload);
  pushLog(result);

  item.attempts += 1;
  item.updatedAt = new Date().toISOString();

  if (result.status === "SENT") {
    const index = inMemoryDeadLetterQueue.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      inMemoryDeadLetterQueue.splice(index, 1);
    }
  } else {
    item.lastError = result.error ?? item.lastError;
  }

  return {
    result,
    deadLetter: item,
  };
}
