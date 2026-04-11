/**
 * driverForm.schema.ts
 *
 * Zod validation schemas for the driver create and update forms. These schemas
 * define exactly what data is considered valid before it can be sent to the API.
 *
 * There are two schemas:
 *   - driverCreateSchema: all fields are required (except phone, which is optional).
 *   - driverUpdateSchema: extends the create schema but makes every field optional
 *     (via .partial()), and adds a required "id" field so the API knows which
 *     driver to update. This means you can send only the fields that changed.
 *
 * The exported types (ValidatedDriverCreateValues, ValidatedDriverUpdateValues)
 * represent the shape of data AFTER it passes validation. They are used by the
 * form and page components to ensure type safety end-to-end.
 */
import { z } from "zod";

import { DRIVER_LICENSES, GENDERS, VEHICLE_TYPES } from "../../../constants/enums";
import { optionalPhoneSchema } from "../../shared/schemas/commonFields.schema";

/** Helper that creates a trimmed string field that cannot be empty. */
const requiredText = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

/**
 * Schema for creating a new driver. Every field except phone is required.
 * The enum validators ensure that values like gender and license are one of
 * the allowed options defined in the shared enums file.
 */
export const driverCreateSchema = z.object({
  name: requiredText("Driver name"),
  gender: z.enum(GENDERS, { error: "Driver gender is required" }),
  license: z.enum(DRIVER_LICENSES, { error: "Driver license is required" }),
  entitledToDrive: z.enum(VEHICLE_TYPES, { error: "Driver entitlement is required" }),
  phone: optionalPhoneSchema,
});

/**
 * Schema for updating an existing driver. It reuses the create schema but
 * makes all fields optional (so you only need to send what changed) and
 * adds a required "id" so the API knows which driver to update.
 */
export const driverUpdateSchema = driverCreateSchema
  .partial()
  .extend({
    id: z.coerce.number().int().positive("Driver id must be valid"),
  });

/** The shape of validated data when creating a new driver. */
export type ValidatedDriverCreateValues = z.output<typeof driverCreateSchema>;

/** The shape of validated data when updating an existing driver. */
export type ValidatedDriverUpdateValues = z.output<typeof driverUpdateSchema>;
