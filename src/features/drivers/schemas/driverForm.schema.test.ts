/**
 * driverForm.schema.test.ts
 *
 * Unit tests for the driver Zod validation schemas. Verifies that:
 *   - The create schema accepts a fully valid driver payload.
 *   - The create schema rejects payloads with missing or invalid required fields.
 *   - The update schema rejects an invalid (zero) driver ID.
 */
import { describe, expect, it } from "vitest";

import { driverCreateSchema, driverUpdateSchema } from "./driverForm.schema";

describe("driver schemas", () => {
	it("accepts valid driver create payload", () => {
		const result = driverCreateSchema.safeParse({
			name: "Joao Silva",
			gender: "Male",
			license: "D",
			entitledToDrive: "Van",
			phone: "+351910000100",
		});

		expect(result.success).toBe(true);
	});

	it("rejects invalid create payload with missing required fields", () => {
		const result = driverCreateSchema.safeParse({
			name: "",
			gender: "",
			license: "",
			entitledToDrive: "",
			phone: "abc",
		});

		expect(result.success).toBe(false);
	});

	it("rejects invalid driver update id", () => {
		const result = driverUpdateSchema.safeParse({
			id: 0,
		});

		expect(result.success).toBe(false);
	});
});



