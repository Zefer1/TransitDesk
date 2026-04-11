import { afterEach, describe, expect, it, vi } from "vitest";

import { MOCK_DELAY_MAX_MS, MOCK_DELAY_MIN_MS, mockDelay } from "./mockDelay";
import { listServices } from "./services.api";
import { listVehicles } from "./vehicles.api";
import { listDrivers } from "./drivers.api";

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

describe("mock APIs latency consistency", () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("applies at least minimum delay to listServices/listVehicles/listDrivers", async () => {
		vi.useFakeTimers();
		vi.spyOn(Math, "random").mockReturnValue(0);

		const servicesPromise = listServices();
		const vehiclesPromise = listVehicles();
		const driversPromise = listDrivers();

		let servicesResolved = false;
		let vehiclesResolved = false;
		let driversResolved = false;

		servicesPromise.then(() => {
			servicesResolved = true;
		});
		vehiclesPromise.then(() => {
			vehiclesResolved = true;
		});
		driversPromise.then(() => {
			driversResolved = true;
		});

		await vi.advanceTimersByTimeAsync(MOCK_DELAY_MIN_MS - 1);
		expect(servicesResolved).toBe(false);
		expect(vehiclesResolved).toBe(false);
		expect(driversResolved).toBe(false);

		await vi.advanceTimersByTimeAsync(1);
		expect(servicesResolved).toBe(true);
		expect(vehiclesResolved).toBe(true);
		expect(driversResolved).toBe(true);
	});
});



