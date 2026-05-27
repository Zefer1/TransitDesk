export function formatDateTime(value: string): string {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return value;
	}

	return parsed.toLocaleString();
}

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



