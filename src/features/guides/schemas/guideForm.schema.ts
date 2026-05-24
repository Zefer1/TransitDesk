import { z } from "zod";

import { GENDERS } from "../../../constants/enums";
import { optionalPhoneSchema } from "../../shared/schemas/commonFields.schema";

const requiredText = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const languageSchema = z.string().trim().min(1, "Guide language is required");

export const guideCreateSchema = z.object({
  name: requiredText("Guide name"),
  gender: z.enum(GENDERS, { error: "Guide gender is required" }),
  phone: optionalPhoneSchema,
  languages: z.array(languageSchema).min(1, "At least one language is required"),
});

export const guideUpdateSchema = guideCreateSchema
  .partial()
  .extend({
    id: z.coerce.number().int().positive("Guide id must be valid"),
  });

export type ValidatedGuideCreateValues = z.output<typeof guideCreateSchema>;
export type ValidatedGuideUpdateValues = z.output<typeof guideUpdateSchema>;
