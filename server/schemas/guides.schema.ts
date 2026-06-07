import { z } from "zod";
import { GENDERS } from "./constants.js";
import { requiredText, optionalPhone } from "./fields.js";

export const guideCreateSchema = z.object({
    name: requiredText("Guide name"),
    gender: z.enum(GENDERS, { error: "Guide gender is required" }),
    phone: optionalPhone,
    languages: z.array(z.string().trim().min(1, "Language cannot be empty")).min(1, "At least one language is required"),
});

export const guideUpdateSchema = guideCreateSchema.partial();
