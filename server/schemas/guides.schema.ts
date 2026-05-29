import { z } from "zod";
import { GENDERS } from "./constants.js";

const requiredText = (field: string) => z.string().trim().min(1, `${field} is required`);

const optionalPhone = z.union([
    z.literal(""),
    z.string().trim().regex(/^\+?[0-9\s-]{9,20}$/, "Phone must be a valid phone number"),
]).optional();

export const guideCreateSchema = z.object({
    name: requiredText("Guide name"),
    gender: z.enum(GENDERS, { error: "Guide gender is required" }),
    phone: optionalPhone,
    languages: z.array(z.string().trim().min(1, "Language cannot be empty")).min(1, "At least one language is required"),
});

export const guideUpdateSchema = guideCreateSchema.partial();
