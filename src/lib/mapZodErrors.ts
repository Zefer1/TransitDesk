import type { z } from "zod";

export function mapZodErrors(error: z.ZodError): Record<string, string> {
	return error.issues.reduce<Record<string, string>>((allErrors, issue) => {
		const key = issue.path.map(String).join(".");
		if (key && !allErrors[key]) {
			allErrors[key] = issue.message;
		}
		return allErrors;
	}, {});
}



