import { z } from "zod";
import { GENDERS, DRIVER_LICENSES, VEHICLE_TYPES } from "./constants.js";

const requiredText = (field: string) => z.string().trim().min(1, `${field} is required`);

const optionalPhone = z.union([
    z.literal(""),
    z.string().trim().regex(/^\+?[0-9\s-]{9,20}$/, "Phone must be a valid phone number"),
]).optional();

export const driverCreateSchema = z.object({
    name: requiredText("Driver name"),
    gender: z.enum(GENDERS, { error: "Driver gender is required" }),
    license: z.enum(DRIVER_LICENSES, { error: "Driver license is required" }),
    entitledToDrive: z.enum(VEHICLE_TYPES, { error: "Driver entitlement is required" }),
    phone: optionalPhone,
});

export const driverUpdateSchema = driverCreateSchema.partial();
