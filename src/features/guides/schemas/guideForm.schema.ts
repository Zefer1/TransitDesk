/**
 * guideForm.schema.ts
 *
 * Defines the Zod validation schemas for guide forms. These schemas are the
 * single source of truth for what counts as valid guide data on the client side.
 *
 * There are two schemas:
 *   - guideCreateSchema: used when creating a new guide (all fields required)
 *   - guideUpdateSchema: used when editing (fields are optional, but ID is required)
 *
 * The type exports at the bottom (ValidatedGuideCreateValues, ValidatedGuideUpdateValues)
 * are TypeScript types automatically derived from the schemas. This means the
 * form types and the validation rules can never get out of sync.
 */
import { z } from "zod";

import { GENDERS } from "../../../constants/enums";
import { optionalPhoneSchema } from "../../shared/schemas/commonFields.schema";

// Helper that creates a required, trimmed string field with a custom error message.
const requiredText = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

// Each language entry must be a non-empty trimmed string.
const languageSchema = z.string().trim().min(1, "Guide language is required");

// Schema for creating a new guide -- every field except phone is required.
export const guideCreateSchema = z.object({
  name: requiredText("Guide name"),
  gender: z.enum(GENDERS, { error: "Guide gender is required" }),
  phone: optionalPhoneSchema,
  languages: z.array(languageSchema).min(1, "At least one language is required"),
});

/**
 * Schema for updating an existing guide.
 * .partial() makes all the create fields optional (so you can send only what changed),
 * then .extend() adds the required `id` field so the API knows which guide to update.
 */
export const guideUpdateSchema = guideCreateSchema
  .partial()
  .extend({
    id: z.coerce.number().int().positive("Guide id must be valid"),
  });

// These types are inferred from the schemas above. Use them in function signatures
// so TypeScript enforces that data has been validated before it reaches the API layer.
export type ValidatedGuideCreateValues = z.output<typeof guideCreateSchema>;
export type ValidatedGuideUpdateValues = z.output<typeof guideUpdateSchema>;
