/**
 * guideForm.schema.test.ts
 *
 * Unit tests for the guide Zod validation schemas (guideCreateSchema and
 * guideUpdateSchema). Verifies that valid payloads pass, required fields
 * are enforced (e.g. languages must be non-empty), and invalid IDs on the
 * update schema are rejected.
 */
import { describe, expect, it } from "vitest";

import { guideCreateSchema, guideUpdateSchema } from "./guideForm.schema";

describe("guide schemas", () => {
	it("accepts valid guide create payload", () => {
		const result = guideCreateSchema.safeParse({
			name: "Maria Santos",
			gender: "Female",
			phone: "+351910000111",
			languages: ["Portuguese", "English"],
		});

		expect(result.success).toBe(true);
	});

	it("rejects create payload when languages are missing", () => {
		const result = guideCreateSchema.safeParse({
			name: "Maria Santos",
			gender: "Female",
			languages: [],
		});

		expect(result.success).toBe(false);
	});

	it("rejects invalid guide update id", () => {
		const result = guideUpdateSchema.safeParse({ id: 0 });

		expect(result.success).toBe(false);
	});
});



