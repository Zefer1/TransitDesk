/** Zod schema for service create validation. Validates all fields including nested vehicle, driver, and optional guide. */
import { z } from "zod";

import {
  DRIVER_LICENSES,
  GENDERS,
  SERVICE_STATUSES,
  SERVICE_TYPES,
  VEHICLE_TYPES,
} from "../../../constants/enums";
import { optionalPhoneSchema } from "../../shared/schemas/commonFields.schema";
import { vehicleWithIdSchema } from "../../vehicles/schemas/vehicleBase.schema";

export { DRIVER_LICENSES, GENDERS, SERVICE_TYPES, VEHICLE_TYPES } from "../../../constants/enums";

const requiredText = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const optionalPositiveNumber = (fieldName: string) =>
  z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z
      .coerce
      .number({ error: `${fieldName} must be a number` })
      .positive(`${fieldName} must be greater than 0`)
      .optional(),
  );

const vehicleSchema = vehicleWithIdSchema;

const driverSchema = z.object({
  id: z.coerce.number().int().positive("Driver is required"),
  name: requiredText("Driver name"),
  gender: z.enum(GENDERS, { error: "Driver gender is required" }),
  license: z.enum(DRIVER_LICENSES, { error: "Driver license is required" }),
  entitledToDrive: z.enum(VEHICLE_TYPES, { error: "Driver entitlement is required" }),
  phone: optionalPhoneSchema,
});

const guideSchema = z.object({
  id: z.coerce.number().int().positive("Guide id must be valid"),
  name: requiredText("Guide name"),
  gender: z.enum(GENDERS, { error: "Guide gender is required" }),
  phone: optionalPhoneSchema,
  languages: z.array(requiredText("Guide language")).optional(),
});

const scheduledAtSchema = requiredText("Scheduled time")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Scheduled time must be a valid date",
  })
  .refine((value) => new Date(value).getTime() > Date.now(), {
    message: "Scheduled time must be in the future",
  });

export const serviceCreateSchema = z.object({
  scheduledAt: scheduledAtSchema,
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

export type ValidatedServiceCreateValues = z.output<typeof serviceCreateSchema>;
