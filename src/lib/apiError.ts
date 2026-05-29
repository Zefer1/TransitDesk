import axios from "axios";

export function extractApiError(error: unknown, fallback: string): string {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data;
		if (data?.errors?.length) {
			return data.errors.map((e: { message: string }) => e.message).join(". ");
		}
		if (data?.error) {
			return data.error;
		}
	}
	return fallback;
}
