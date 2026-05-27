import { z } from "zod";

export const optionalPhoneSchema = z.union([
  z.literal(""),
  z.string().trim().regex(/^\+?[0-9\s-]{9,20}$/, "Phone must be a valid phone number"),
]).optional();



