/** Formatting utilities for service display: date/time formatting, duration display, and cancellation notes builder. */
// Formatters centralize display-safe date/time and notes rendering logic for service UIs.

// Keeps raw persisted timestamps safe for UI rendering, with graceful fallback for invalid values.
export function formatDateTime(value: string): string {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return value;
	}

	return parsed.toLocaleString();
}

// Converts minutes into compact human-readable duration labels.
export function formatTotalEstimatedTime(minutes?: number): string {
	if (!minutes || minutes <= 0) {
		return "Not specified";
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (hours === 0) {
		return `${remainingMinutes} min`;
	}

	if (remainingMinutes === 0) {
		return `${hours}h`;
	}

	return `${hours}h ${remainingMinutes}m`;
}

// Appends cancellation reason once and preserves existing operator notes.
export function buildCancellationNotes(existingNotes: string | undefined, reason: string): string {
	const trimmedExisting = (existingNotes ?? "").trim();
	const reasonLine = `Cancellation reason: ${reason.trim()}`;

	if (!trimmedExisting) {
		return reasonLine;
	}

	if (trimmedExisting.includes(reasonLine)) {
		return trimmedExisting;
	}

	return `${trimmedExisting}\n${reasonLine}`;
}



