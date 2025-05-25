import { z } from "zod";

export const GuideEntry = z.object({
  axis: z.enum(["X", "Y"]),
  offset: z.number(),
  delete: z.boolean().optional(),
});

export const SetGuideSchema = z.object({
  guide: GuideEntry.optional(),
  guides: z.array(GuideEntry).optional(),
});

export const GetGuideSchema = z.object({}); // No params
