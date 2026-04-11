/**
 * vehicleForm.schema.test.ts
 *
 * Unit tests for the vehicle Zod schemas (create and update).
 * Checks that valid payloads pass, invalid payloads are rejected,
 * and the update schema enforces a positive integer ID.
 */
import { describe, expect, it } from "vitest";

import { vehicleCreateSchema, vehicleUpdateSchema } from "./vehicleForm.schema";

describe("vehicle schemas", () => {
	it("accepts valid vehicle create payload", () => {
		const result = vehicleCreateSchema.safeParse({
			licensePlate: "AA-12-BB",
			brand: "Mercedes",
			model: "Sprinter",
			year: 2023,
			passengerCapacity: 16,
			type: "Van",
			color: "White",
			active: true,
		});

		expect(result.success).toBe(true);
	});

	it("rejects invalid vehicle create payload", () => {
		const result = vehicleCreateSchema.safeParse({
			licensePlate: "",
			brand: "",
			model: "",
			year: 1200,
			passengerCapacity: 0,
			type: "",
			color: "",
		});

		expect(result.success).toBe(false);
	});

	it("rejects invalid vehicle update id", () => {
		const result = vehicleUpdateSchema.safeParse({ id: -1 });

		expect(result.success).toBe(false);
	});
});



