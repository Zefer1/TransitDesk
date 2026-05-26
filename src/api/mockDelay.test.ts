import { afterEach, describe, expect, it, vi } from "vitest";

import { MOCK_DELAY_MAX_MS, MOCK_DELAY_MIN_MS, mockDelay } from "./mockDelay";

describe("mockDelay", () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("resolves at minimum bound when random = 0", async () => {
		vi.useFakeTimers();
		vi.spyOn(Math, "random").mockReturnValue(0);

		const promise = mockDelay();
		let resolved = false;
		promise.then(() => {
			resolved = true;
		});

		await vi.advanceTimersByTimeAsync(MOCK_DELAY_MIN_MS - 1);
		expect(resolved).toBe(false);

		await vi.advanceTimersByTimeAsync(1);
		expect(resolved).toBe(true);
	});

	it("never exceeds maximum bound when random is near 1", async () => {
		vi.useFakeTimers();
		vi.spyOn(Math, "random").mockReturnValue(0.999999);

		const promise = mockDelay();
		let resolved = false;
		promise.then(() => {
			resolved = true;
		});

		await vi.advanceTimersByTimeAsync(MOCK_DELAY_MIN_MS - 1);
		expect(resolved).toBe(false);

		await vi.advanceTimersByTimeAsync(MOCK_DELAY_MAX_MS - MOCK_DELAY_MIN_MS + 1);
		expect(resolved).toBe(true);
	});
});




