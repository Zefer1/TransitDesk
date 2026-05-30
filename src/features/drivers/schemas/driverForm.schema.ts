import { z } from "zod";

import { DRIVER_LICENSES, GENDERS, VEHICLE_TYPES } from "../../../constants/enums";
import { optionalPhoneSchema } from "../../shared/schemas/commonFields.schema";

const requiredText = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const LIGHT_LICENSES = ["B1", "B", "BE"];
const HEAVY_ONLY_TYPES = ["Heavy Vehicle", "Bus", "School Bus", "Minibus"];

const ENTITLEMENT_MESSAGE =
  "A light license (B1, B, BE) cannot drive Heavy Vehicle, Bus, School Bus, or Minibus";

function licenseCoversVehicle(license?: string, entitledToDrive?: string): boolean {
  if (!license || !entitledToDrive) return true;
  return !(LIGHT_LICENSES.includes(license) && HEAVY_ONLY_TYPES.includes(entitledToDrive));
}

const driverBaseSchema = z.object({
  name: requiredText("Driver name"),
  gender: z.enum(GENDERS, { error: "Driver gender is required" }),
  license: z.enum(DRIVER_LICENSES, { error: "Driver license is required" }),
  entitledToDrive: z.enum(VEHICLE_TYPES, { error: "Driver entitlement is required" }),
  phone: optionalPhoneSchema,
});

export const driverCreateSchema = driverBaseSchema.refine(
  (data) => licenseCoversVehicle(data.license, data.entitledToDrive),
  { message: ENTITLEMENT_MESSAGE, path: ["entitledToDrive"] },
);

export const driverUpdateSchema = driverBaseSchema
  .partial()
  .extend({
    id: z.coerce.number().int().positive("Driver id must be valid"),
  })
  .refine(
    (data) => licenseCoversVehicle(data.license, data.entitledToDrive),
    { message: ENTITLEMENT_MESSAGE, path: ["entitledToDrive"] },
  );

export type ValidatedDriverCreateValues = z.output<typeof driverCreateSchema>;

export type ValidatedDriverUpdateValues = z.output<typeof driverUpdateSchema>;
