import { z } from "zod";

const ROLES = ["SUPER_ADMIN", "ADMIN", "EMPLOYEE"] as const;

export const userCreateSchema = z.object({
    username: z.string().trim().min(1, "Username is required").max(64, "Username is too long"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().trim().min(1, "Name is required"),
    role: z.enum(ROLES, { error: "Role must be SUPER_ADMIN, ADMIN, or EMPLOYEE" }),
});

export const userUpdateSchema = z.object({
    name: z.string().trim().min(1, "Name is required").optional(),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    role: z.enum(ROLES).optional(),
});
