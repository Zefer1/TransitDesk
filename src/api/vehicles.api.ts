/**
 * Mock API for Vehicles.
 *
 * Works exactly like drivers.api.ts -- an in-memory array pretends to be a
 * database, and every function adds a short delay to simulate real network
 * latency. When the real backend is ready, swap the implementations for
 * Axios calls but keep the same function signatures.
 */
import type { Vehicle } from "../types/service.types";
import type { ApiResponse, PaginatedApiResponse } from "../types/api.types";
import { mockDelay } from "./mockDelay";

/** Seed data -- the vehicles that exist when the app first loads. */
const initialVehicles: Vehicle[] = [
	{
		id: 1,
		licensePlate: "AA-12-BB",
		brand: "Mercedes",
		model: "Sprinter",
		year: 2022,
		passengerCapacity: 16,
		type: "Van",
		color: "White",
		active: true,
	},
	{
		id: 2,
		licensePlate: "CC-34-DD",
		brand: "Toyota",
		model: "Hiace",
		year: 2021,
		passengerCapacity: 12,
		type: "Van",
		color: "Silver",
		active: true,
	},
];

/** The mutable "database" array. Copied from seed data so we can reset later. */
let vehiclesStore: Vehicle[] = [...initialVehicles];

/** Returns all vehicles, wrapped in a paginated response shape. */
export async function listVehicles(): Promise<PaginatedApiResponse<Vehicle>> {
	await mockDelay();
	return {
		success: true,
		data: vehiclesStore,
		pagination: {
			page: 1,
			pageSize: vehiclesStore.length,
			total: vehiclesStore.length,
			totalPages: 1,
		},
	};
}

/** Finds a single vehicle by its numeric ID. Throws if not found. */
export async function getVehicleById(id: number): Promise<ApiResponse<Vehicle>> {
	await mockDelay();
	const vehicle = vehiclesStore.find((item) => item.id === id);
	if (!vehicle) {
		throw new Error(`Vehicle with id ${id} not found`);
	}
	return { success: true, data: vehicle };
}

/** Creates a new vehicle. Auto-generates an ID by taking the highest existing ID + 1. */
export async function createVehicle(payload: Omit<Vehicle, "id">): Promise<ApiResponse<Vehicle>> {
	await mockDelay();
	const id = vehiclesStore.length ? Math.max(...vehiclesStore.map((item) => item.id)) + 1 : 1;
	const created = { id, ...payload } as Vehicle;
	vehiclesStore = [created, ...vehiclesStore];
	return { success: true, data: created };
}

/** Updates an existing vehicle by merging the provided fields into the stored record. */
export async function updateVehicle(payload: Partial<Vehicle> & { id: number }): Promise<ApiResponse<Vehicle>> {
	await mockDelay();
	const index = vehiclesStore.findIndex((item) => item.id === payload.id);
	if (index < 0) {
		throw new Error(`Vehicle with id ${payload.id} not found`);
	}
	const updated = { ...vehiclesStore[index], ...payload } as Vehicle;
	vehiclesStore[index] = updated;
	return { success: true, data: updated };
}

/** Removes a vehicle from the store by filtering it out. */
export async function deleteVehicle(id: number): Promise<{ success: true; data: { id: number } }> {
	await mockDelay();
	vehiclesStore = vehiclesStore.filter((item) => item.id !== id);
	return { success: true, data: { id } };
}

/** Exposes the raw mock store for use in tests or debugging. */
export function getVehiclesMockStore(): Vehicle[] {
	return vehiclesStore;
}

/** Replaces the entire mock store -- useful for resetting state in tests. */
export function resetVehiclesMockStore(items: Vehicle[]): void {
	vehiclesStore = items;
}

/** Restores the mock store to the original seed data. */
export function resetVehiclesToDefaults(): void {
	resetVehiclesMockStore([...initialVehicles]);
}
