import type { z } from "zod";

// Core flow note: the block below contains the main behavior used by this module.

// Converts nested Zod issue paths into flat key-value errors consumed by form components.

/**
 * Converts a Zod validation error into a flat `{ fieldName: message }` record.
 *
 * Nested paths are joined with dots (e.g., `"vehicle.licensePlate"`).
 * Only the first error per field is kept.
 */
export function mapZodErrors(error: z.ZodError): Record<string, string> {
	return error.issues.reduce<Record<string, string>>((allErrors, issue) => {
		const key = issue.path.map(String).join(".");
		if (key && !allErrors[key]) {
			allErrors[key] = issue.message;
		}
		return allErrors;
	}, {});
}



