import { z } from "zod";

export const requiredText = (field: string) => z.string().trim().min(1, `${field} is required`);

export const optionalPhone = z.union([
    z.literal(""),
    z.string().trim().regex(/^\+?[0-9\s-]{9,20}$/, "Phone must be a valid phone number"),
]).optional();
