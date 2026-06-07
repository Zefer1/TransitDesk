import { z } from "zod";
import { GENDERS, DRIVER_LICENSES, VEHICLE_TYPES } from "./constants.js";
import { requiredText, optionalPhone } from "./fields.js";

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
    phone: optionalPhone,
});

export const driverCreateSchema = driverBaseSchema.refine(
    (data) => licenseCoversVehicle(data.license, data.entitledToDrive),
    { message: ENTITLEMENT_MESSAGE, path: ["entitledToDrive"] },
);

export const driverUpdateSchema = driverBaseSchema.partial().refine(
    (data) => licenseCoversVehicle(data.license, data.entitledToDrive),
    { message: ENTITLEMENT_MESSAGE, path: ["entitledToDrive"] },
);
