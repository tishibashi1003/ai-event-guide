import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { OutputEventSchema } from "./prompt";

export const EventSchema = z.object({
  id: z.string(),
  eventVector: z.array(z.number()),
  ...OutputEventSchema.shape,
  eventDate: z.instanceof(Timestamp),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
});

export const UserSchema = z.object({
  uid: z.string(),
  preferenceVector: z.array(z.number()).optional(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp)
});

export const EventInteractionHistorySchema = z.object({
  userId: z.string(),
  eventId: z.string(),
  action: z.enum(['like', 'dislike', 'kokoiku', 'view']),
  eventVector: z.array(z.number()),
  createdAt: z.instanceof(Timestamp)
});

export type User = z.infer<typeof UserSchema>;
export type EventInteractionHistory = z.infer<typeof EventInteractionHistorySchema>;
export type Event = z.infer<typeof EventSchema>;

