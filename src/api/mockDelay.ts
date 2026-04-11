/**
 * Simulates network latency for mock API calls.
 *
 * Every mock API function calls `mockDelay()` before returning data. This adds
 * a random pause (between 300ms and 800ms by default) so the app behaves as if
 * it were talking to a real server -- loading spinners appear, buttons show
 * "Saving...", and race-condition bugs surface during development.
 */

/** Shortest possible fake delay in milliseconds. */
export const MOCK_DELAY_MIN_MS = 300;

/** Longest possible fake delay in milliseconds. */
export const MOCK_DELAY_MAX_MS = 800;

/**
 * Returns a Promise that resolves after a random delay between minMs and maxMs.
 * This keeps all mock API functions async, just like real network requests.
 */
export function mockDelay(minMs = MOCK_DELAY_MIN_MS, maxMs = MOCK_DELAY_MAX_MS): Promise<void> {
	const jitter = Math.random() * (maxMs - minMs);
	return new Promise((resolve) => {
		setTimeout(resolve, minMs + jitter);
	});
}



