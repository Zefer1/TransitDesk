export const MOCK_DELAY_MIN_MS = 300;

export const MOCK_DELAY_MAX_MS = 800;

export function mockDelay(minMs = MOCK_DELAY_MIN_MS, maxMs = MOCK_DELAY_MAX_MS): Promise<void> {
	const jitter = Math.random() * (maxMs - minMs);
	return new Promise((resolve) => {
		setTimeout(resolve, minMs + jitter);
	});
}
