import crypto from "node:crypto";
import { env } from "../../config/env.js";
import type { NotificationChannel } from "./notifications.service.js";

export type ProviderDispatchInput = {
  recipient: string;
  message: string;
  subject?: string;
  metadata?: Record<string, string>;
};

export type ProviderDispatchResult = {
  status: "SENT" | "FAILED";
  providerMessageId?: string;
  error?: string;
};

export type NotificationProviderAdapter = {
  channel: NotificationChannel;
  providerName:
    | "MOCK_SMS"
    | "MOCK_WHATSAPP"
    | "MOCK_PUSH"
    | "INTERNAL"
    | "LIVE_SMS"
    | "LIVE_WHATSAPP"
    | "LIVE_PUSH";
  isReady: boolean;
  send: (input: ProviderDispatchInput) => Promise<ProviderDispatchResult>;
};

function mockMessageId() {
  return `msg_${crypto.randomUUID()}`;
}

function createMockAdapter(
  channel: NotificationChannel,
): NotificationProviderAdapter {
  const providerNameByChannel: Record<
    NotificationChannel,
    NotificationProviderAdapter["providerName"]
  > = {
    SMS: "MOCK_SMS",
    WHATSAPP: "MOCK_WHATSAPP",
    PUSH: "MOCK_PUSH",
    IN_APP: "INTERNAL",
  };

  return {
    channel,
    providerName: providerNameByChannel[channel],
    isReady: true,
    send: async () => ({
      status: "SENT",
      providerMessageId: mockMessageId(),
    }),
  };
}

function createLiveAdapter(
  channel: NotificationChannel,
): NotificationProviderAdapter {
  if (channel === "IN_APP") {
    return createMockAdapter("IN_APP");
  }

  const keyByChannel: Partial<Record<NotificationChannel, string | undefined>> =
    {
      SMS: env.MTN_MOMO_API_KEY ?? env.VODAFONE_CASH_API_KEY,
      WHATSAPP: env.WHATSAPP_API_TOKEN,
      PUSH: env.FCM_SERVER_KEY,
    };

  const providerByChannel: Partial<
    Record<NotificationChannel, NotificationProviderAdapter["providerName"]>
  > = {
    SMS: "LIVE_SMS",
    WHATSAPP: "LIVE_WHATSAPP",
    PUSH: "LIVE_PUSH",
  };

  const apiKey = keyByChannel[channel];
  const providerName = providerByChannel[channel] ?? "INTERNAL";
  const isReady = Boolean(apiKey);

  return {
    channel,
    providerName,
    isReady,
    send: async () => {
      if (!isReady) {
        return {
          status: "FAILED",
          error: `${providerName} is not configured`,
        };
      }

      // Integration placeholder for real gateway HTTP calls.
      return {
        status: "SENT",
        providerMessageId: mockMessageId(),
      };
    },
  };
}

export function getProviderAdapter(
  channel: NotificationChannel,
): NotificationProviderAdapter {
  if (env.NOTIFICATIONS_MODE === "LIVE") {
    return createLiveAdapter(channel);
  }

  return createMockAdapter(channel);
}

export function getProviderStatus() {
  const channels: NotificationChannel[] = ["SMS", "WHATSAPP", "PUSH", "IN_APP"];

  return channels.map((channel) => {
    const adapter = getProviderAdapter(channel);
    return {
      channel,
      mode: env.NOTIFICATIONS_MODE,
      provider: adapter.providerName,
      isReady: adapter.isReady,
    };
  });
}
