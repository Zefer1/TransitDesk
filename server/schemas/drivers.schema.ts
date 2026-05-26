import { z } from "zod";

const GENDERS = ["Male", "Female"] as const;
const DRIVER_LICENSES = ["B1", "B", "C1", "C", "D1", "D", "BE", "C1E", "CE", "D1E", "DE"] as const;
const VEHICLE_TYPES = ["Light Vehicle", "Heavy Vehicle", "Van", "Minibus", "Bus", "SUV", "Hybrid", "Taxi", "School Bus", "Other"] as const;

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
