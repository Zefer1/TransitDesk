import type { z } from "zod";

export function mapZodErrors(error: z.ZodError): Record<string, string> {
	const errors: Record<string, string> = {};
	for (const issue of error.issues) {
		const key = issue.path.map(String).join(".");
		if (key && !errors[key]) {
			errors[key] = issue.message;
		}
	}
	return errors;
}



