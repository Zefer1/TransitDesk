import { z } from "zod";

const GENDERS = ["Male", "Female"] as const;
const DRIVER_LICENSES = ["B1", "B", "C1", "C", "D1", "D", "BE", "C1E", "CE", "D1E", "DE"] as const;
const VEHICLE_TYPES = ["Light Vehicle", "Heavy Vehicle", "Van", "Minibus", "Bus", "SUV", "Hybrid", "Taxi", "School Bus", "Other"] as const;
const SERVICE_TYPES = ["Tour", "Levada", "Transfer", "Taxi", "Shuttle"] as const;
const SERVICE_STATUSES = ["scheduled", "ongoing", "completed", "cancelled"] as const;

const requiredText = (field: string) => z.string().trim().min(1, `${field} is required`);

const optionalPhone = z.union([
    z.literal(""),
    z.string().trim().regex(/^\+?[0-9\s-]{9,20}$/, "Phone must be a valid phone number"),
]).optional();

const optionalPositiveNumber = (field: string) =>
    z.preprocess(
        (v) => (v === "" || v == null ? undefined : v),
        z.coerce.number().positive(`${field} must be greater than 0`).optional(),
    );

const vehicleSchema = z.object({
    id: z.coerce.number().int().positive("Vehicle is required"),
    licensePlate: requiredText("License plate"),
    brand: requiredText("Brand"),
    model: requiredText("Model"),
    year: z.coerce.number().int().min(1900),
    passengerCapacity: z.coerce.number().int().positive(),
    type: z.enum(VEHICLE_TYPES),
    color: requiredText("Color"),
    registrationDate: z.string().optional(),
    inspectionExpiry: z.string().optional(),
    active: z.boolean().optional(),
    notes: z.string().optional(),
    suitedFor: z.enum(SERVICE_TYPES).optional(),
});

const driverSchema = z.object({
    id: z.coerce.number().int().positive("Driver is required"),
    name: requiredText("Driver name"),
    gender: z.enum(GENDERS),
    license: z.enum(DRIVER_LICENSES),
    entitledToDrive: z.enum(VEHICLE_TYPES),
    phone: optionalPhone,
});

const guideSchema = z.object({
    id: z.coerce.number().int().positive("Guide id must be valid"),
    name: requiredText("Guide name"),
    gender: z.enum(GENDERS),
    phone: optionalPhone,
    languages: z.array(z.string().trim()).optional(),
});

export const serviceCreateSchema = z.object({
    scheduledAt: requiredText("Scheduled time").refine(
        (v) => !Number.isNaN(new Date(v).getTime()),
        "Scheduled time must be a valid date",
    ),
    agencyName: z.string().trim().optional(),
    description: requiredText("Description"),
    stops: z.array(requiredText("Stop")).min(1, "At least one stop is required"),
    distanceKm: optionalPositiveNumber("Distance"),
    estimatedDurationMin: optionalPositiveNumber("Estimated duration"),
    status: z.enum(SERVICE_STATUSES).default("scheduled"),
    type: z.enum(SERVICE_TYPES, { error: "Service type is required" }),
    vehicle: vehicleSchema,
    passengerQuantity: z.coerce.number().int().positive("Passenger quantity must be greater than 0"),
    driver: driverSchema,
    guide: guideSchema.optional(),
    notes: z.string().trim().optional(),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

export const serviceStatusSchema = z.object({
    status: z.enum(SERVICE_STATUSES, { error: "Status must be a valid service status" }),
});
