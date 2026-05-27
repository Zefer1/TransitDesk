import { z } from "zod";

import { DRIVER_LICENSES, GENDERS, VEHICLE_TYPES } from "../../../constants/enums";
import { optionalPhoneSchema } from "../../shared/schemas/commonFields.schema";

const requiredText = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

export const driverCreateSchema = z.object({
  name: requiredText("Driver name"),
  gender: z.enum(GENDERS, { error: "Driver gender is required" }),
  license: z.enum(DRIVER_LICENSES, { error: "Driver license is required" }),
  entitledToDrive: z.enum(VEHICLE_TYPES, { error: "Driver entitlement is required" }),
  phone: optionalPhoneSchema,
});

export const driverUpdateSchema = driverCreateSchema
  .partial()
  .extend({
    id: z.coerce.number().int().positive("Driver id must be valid"),
  });

export type ValidatedDriverCreateValues = z.output<typeof driverCreateSchema>;

export type ValidatedDriverUpdateValues = z.output<typeof driverUpdateSchema>;
