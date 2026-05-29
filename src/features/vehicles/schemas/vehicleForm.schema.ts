import { z } from "zod";

import { vehicleBaseFieldsSchema } from "./vehicleBase.schema";

export const vehicleCreateSchema = vehicleBaseFieldsSchema;

export const vehicleUpdateSchema = vehicleCreateSchema
  .partial()
  .extend({
    id: z.coerce.number().int().positive("Vehicle id must be valid"),
  });

export type ValidatedVehicleCreateValues = z.output<typeof vehicleCreateSchema>;
export type ValidatedVehicleUpdateValues = z.output<typeof vehicleUpdateSchema>;
