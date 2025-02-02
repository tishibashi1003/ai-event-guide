
import { z } from "zod";

export const EventInteractionInputSchema = z.object({
  userId: z.string(),
  interactions: z.array(
    z.object({
      eventId: z.string(),
      action: z.enum(['like', 'dislike', 'kokoikku'])
    })
  )
});

export type EventInteractionInput = z.infer<typeof EventInteractionInputSchema>;
