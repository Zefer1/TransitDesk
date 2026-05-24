import { z } from "zod";

import { SERVICE_TYPES, VEHICLE_TYPES } from "../../../constants/enums";

const requiredText = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const optionalDate = (fieldName: string) =>
  z.union([
    z.literal(""),
    z.string().trim().refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: `${fieldName} must be a valid date`,
    }),
  ]).optional();

export const vehicleBaseFieldsSchema = z.object({
  licensePlate: requiredText("License plate").max(32, "License plate is too long"),
  brand: requiredText("Brand"),
  model: requiredText("Model"),
  year: z.coerce
    .number({ error: "Year must be a number" })
    .int("Year must be a whole number")
    .min(1900, "Year must be after 1900")
    .max(new Date().getFullYear() + 1, "Year must be valid"),
  passengerCapacity: z.coerce
    .number({ error: "Passenger capacity must be a number" })
    .int("Passenger capacity must be a whole number")
    .positive("Passenger capacity must be greater than 0"),
  type: z.enum(VEHICLE_TYPES, { error: "Vehicle type is required" }),
  color: requiredText("Color"),
  registrationDate: optionalDate("Registration date"),
  inspectionExpiry: optionalDate("Inspection expiry"),
  active: z.boolean().optional(),
  notes: z.string().trim().optional(),
  suitedFor: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(SERVICE_TYPES).optional()
  ),
});

export const vehicleWithIdSchema = vehicleBaseFieldsSchema.extend({
  id: z.coerce.number().int().positive("Vehicle is required"),
});



