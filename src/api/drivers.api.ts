/**
 * Mock API for Drivers.
 *
 * This file pretends to be a real backend server. Each function waits a short
 * random delay (to mimic network latency) and then reads or writes to an
 * in-memory array instead of a database.
 *
 * When the real backend is ready, you will replace these functions with actual
 * HTTP calls (using Axios) while keeping the same function signatures so that
 * the rest of the app does not need to change.
 */
import type { Driver } from "../types/service.types";
import type { ApiResponse, PaginatedApiResponse } from "../types/api.types";
import { mockDelay } from "./mockDelay";

/** Seed data -- the drivers that exist when the app first loads. */
const initialDrivers: Driver[] = [
	{
		id: 1,
		name: "Joao Silva",
		gender: "Male",
		license: "D",
		entitledToDrive: "Van",
		phone: "+351910000000",
	},
	{
		id: 2,
		name: "Pedro Costa",
		gender: "Male",
		license: "D1",
		entitledToDrive: "Minibus",
		phone: "+351910000001",
	},
	{
		id: 3,
		name: "Ana Freitas",
		gender: "Female",
		license: "B",
		entitledToDrive: "Light Vehicle",
		phone: "+351910000002",
	},
];

/**
 * The "database" -- a mutable array that holds the current list of drivers.
 * We copy initialDrivers so we can reset back to the original data later.
 */
let driversStore: Driver[] = [...initialDrivers];

/** Returns all drivers, wrapped in a paginated response shape. */
export async function listDrivers(): Promise<PaginatedApiResponse<Driver>> {
	await mockDelay();
	return {
		success: true,
		data: driversStore,
		pagination: {
			page: 1,
			pageSize: driversStore.length,
			total: driversStore.length,
			totalPages: 1,
		},
	};
}

/** Finds a single driver by its numeric ID. Throws if not found. */
export async function getDriverById(id: number): Promise<ApiResponse<Driver>> {
	await mockDelay();
	const driver = driversStore.find((item) => item.id === id);
	if (!driver) {
		throw new Error(`Driver with id ${id} not found`);
	}
	return { success: true, data: driver };
}

/** Creates a new driver. Auto-generates an ID by taking the highest existing ID + 1. */
export async function createDriver(payload: Omit<Driver, "id">): Promise<ApiResponse<Driver>> {
	await mockDelay();
	const id = driversStore.length ? Math.max(...driversStore.map((item) => item.id)) + 1 : 1;
	const created = { id, ...payload } as Driver;
	driversStore = [created, ...driversStore];
	return { success: true, data: created };
}

/** Updates an existing driver by merging the provided fields into the stored record. */
export async function updateDriver(payload: Partial<Driver> & { id: number }): Promise<ApiResponse<Driver>> {
	await mockDelay();
	const index = driversStore.findIndex((item) => item.id === payload.id);
	if (index < 0) {
		throw new Error(`Driver with id ${payload.id} not found`);
	}
	const updated = { ...driversStore[index], ...payload } as Driver;
	driversStore[index] = updated;
	return { success: true, data: updated };
}

/** Removes a driver from the store by filtering it out. */
export async function deleteDriver(id: number): Promise<{ success: true; data: { id: number } }> {
	await mockDelay();
	driversStore = driversStore.filter((item) => item.id !== id);
	return { success: true, data: { id } };
}

/** Exposes the raw mock store for use in tests or debugging. */
export function getDriversMockStore(): Driver[] {
	return driversStore;
}

/** Replaces the entire mock store -- useful for resetting state in tests. */
export function resetDriversMockStore(items: Driver[]): void {
	driversStore = items;
}

/** Restores the mock store to the original seed data. */
export function resetDriversToDefaults(): void {
	resetDriversMockStore([...initialDrivers]);
}
