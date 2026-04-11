/** Reusable Zod field schemas shared across features (e.g., optional phone validation). */
import { z } from "zod";

// Core flow note: the block below contains the main behavior used by this module.

// Common field validators below are reused across feature schemas to avoid duplication.

export const optionalPhoneSchema = z.union([
  z.literal(""),
  z.string().trim().regex(/^\+?[0-9\s-]{9,20}$/, "Phone must be a valid phone number"),
]).optional();



