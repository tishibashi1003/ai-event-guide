import { Timestamp } from 'firebase/firestore';
import { z } from "zod";

export const EventSchema = z.object({
  id: z.string(),
  eventVector: z.array(z.number()),
  eventTitleJa: z.string(),
  eventDescriptionJa: z.string(),
  eventDateYYYYMMDD: z.string(),
  eventLocationNameJa: z.string(),
  eventLocationCity: z.string(),
  eventSourceUrl: z.string(),
  eventEmoji: z.string(),
  eventCategoryEn: z.string(),
  eventDate: z.instanceof(Timestamp),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
});

export const UserSchema = z.object({
  uid: z.string(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp)
});

export const EventSwipeHistorySchema = z.object({
  userId: z.string(),
  eventId: z.string(),
  action: z.enum(['like', 'dislike', 'kokoikku']),
  eventVector: z.array(z.number()),
  timestamp: z.instanceof(Timestamp)
});

export type User = z.infer<typeof UserSchema>;
export type Event = z.infer<typeof EventSchema>;
export type EventSwipeHistory = z.infer<typeof EventSwipeHistorySchema>;
