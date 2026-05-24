import type { Vehicle } from "../types/service.types";
import type { ApiResponse, PaginatedApiResponse } from "../types/api.types";
import { mockDelay } from "./mockDelay";

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

let vehiclesStore: Vehicle[] = [...initialVehicles];

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

export async function getVehicleById(id: number): Promise<ApiResponse<Vehicle>> {
	await mockDelay();
	const vehicle = vehiclesStore.find((item) => item.id === id);
	if (!vehicle) {
		throw new Error(`Vehicle with id ${id} not found`);
	}
	return { success: true, data: vehicle };
}

export async function createVehicle(payload: Omit<Vehicle, "id">): Promise<ApiResponse<Vehicle>> {
	await mockDelay();
	const id = vehiclesStore.length ? Math.max(...vehiclesStore.map((item) => item.id)) + 1 : 1;
	const created = { id, ...payload } as Vehicle;
	vehiclesStore = [created, ...vehiclesStore];
	return { success: true, data: created };
}

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

export async function deleteVehicle(id: number): Promise<{ success: true; data: { id: number } }> {
	await mockDelay();
	vehiclesStore = vehiclesStore.filter((item) => item.id !== id);
	return { success: true, data: { id } };
}

export function getVehiclesMockStore(): Vehicle[] {
	return vehiclesStore;
}

export function resetVehiclesMockStore(items: Vehicle[]): void {
	vehiclesStore = items;
}

export function resetVehiclesToDefaults(): void {
	resetVehiclesMockStore([...initialVehicles]);
}
