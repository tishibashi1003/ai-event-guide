import { Timestamp } from 'firebase/firestore';
import { z } from "zod";

export const EventSchema = z.object({
  id: z.string(),
  eventVector: z.array(z.number()),
  eventTitleJa: z.string(),
  eventTitleEn: z.string(),
  eventDescriptionJa: z.string(),
  eventDescriptionEn: z.string(),
  eventDateYYYYMMDD: z.string(),
  eventLocationNameJa: z.string(),
  eventLocationNameEn: z.string(),
  eventLocationCityJa: z.string(),
  eventLocationCityEn: z.string(),
  eventSourceUrl: z.string(),
  eventEmoji: z.string(),
  eventCategoryEn: z.string(),
  eventDate: z.instanceof(Timestamp),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  renderedContent: z.string(),
});

export const UserSchema = z.object({
  uid: z.string(),
  preferenceVector: z.array(z.number()).optional(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  isAnonymous: z.boolean().optional(),
});

export const EventInteractionHistorySchema = z.object({
  userId: z.string(),
  eventId: z.string(),
  action: z.enum(['like', 'dislike', 'kokoiku', 'view']),
  eventVector: z.array(z.number()),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  aiPlanning: z.string().optional(),
  aiPlanningCreatedAt: z.instanceof(Timestamp).optional(),
  clickContext: z.object({
    source: z.enum(['recommended', 'all']),
    isRecommended: z.boolean(),
  }).optional(),
  npsData: z.object({
    score: z.number().min(0).max(10),
    feedback: z.string(),
    createdAt: z.instanceof(Timestamp),
  }).optional(),
});

export type User = z.infer<typeof UserSchema>;
export type Event = z.infer<typeof EventSchema>;
export type EventInteractionHistory = z.infer<typeof EventInteractionHistorySchema>;
