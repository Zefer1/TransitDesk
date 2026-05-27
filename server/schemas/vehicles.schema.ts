import { z } from "zod";

const VEHICLE_TYPES = ["Light Vehicle", "Heavy Vehicle", "Van", "Minibus", "Bus", "SUV", "Hybrid", "Taxi", "School Bus", "Other"] as const;
const SERVICE_TYPES = ["Tour", "Levada", "Transfer", "Taxi", "Shuttle"] as const;

const requiredText = (field: string) => z.string().trim().min(1, `${field} is required`);

const optionalDate = (field: string) =>
    z.union([
        z.literal(""),
        z.string().trim().refine((v) => !Number.isNaN(new Date(v).getTime()), `${field} must be a valid date`),
    ]).optional();

export const vehicleCreateSchema = z.object({
    licensePlate: requiredText("License plate").max(32, "License plate is too long"),
    brand: requiredText("Brand"),
    model: requiredText("Model"),
    year: z.coerce.number().int("Year must be a whole number").min(1900, "Year must be after 1900").max(new Date().getFullYear() + 1, "Year must be valid"),
    passengerCapacity: z.coerce.number().int("Passenger capacity must be a whole number").positive("Passenger capacity must be greater than 0"),
    type: z.enum(VEHICLE_TYPES, { error: "Vehicle type is required" }),
    color: requiredText("Color"),
    registrationDate: optionalDate("Registration date"),
    inspectionExpiry: optionalDate("Inspection expiry"),
    active: z.boolean().optional(),
    notes: z.string().trim().optional(),
    suitedFor: z.preprocess((v) => (v === "" ? undefined : v), z.enum(SERVICE_TYPES).optional()),
});

export const vehicleUpdateSchema = vehicleCreateSchema.partial();
