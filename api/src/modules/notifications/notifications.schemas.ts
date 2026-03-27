import { z } from "zod";

export const channelSchema = z.enum(["SMS", "WHATSAPP", "PUSH", "IN_APP"]);

export const sendNotificationSchema = z.object({
  channel: channelSchema,
  recipient: z.string().min(1, "Recipient is required"),
  message: z.string().min(1, "Message is required").max(500),
  subject: z.string().max(120).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const sendBulkNotificationSchema = z.object({
  channel: channelSchema,
  recipients: z.array(z.string().min(1)).min(1).max(500),
  message: z.string().min(1, "Message is required").max(500),
  subject: z.string().max(120).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const retryDeadLetterSchema = z.object({
  id: z.string().min(1, "Dead-letter ID is required"),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type SendBulkNotificationInput = z.infer<
  typeof sendBulkNotificationSchema
>;
export type RetryDeadLetterInput = z.infer<typeof retryDeadLetterSchema>;
