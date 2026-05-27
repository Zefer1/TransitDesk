import type { Vehicle } from "../types/service.types";
import type { ApiResponse, PaginatedApiResponse } from "../types/api.types";
import apiClient from "../lib/apiClient";

export async function listVehicles(): Promise<PaginatedApiResponse<Vehicle>> {
	const { data } = await apiClient.get<{ success: true; data: Vehicle[] }>("/vehicles");
	return {
		success: true,
		data: data.data,
		pagination: { page: 1, pageSize: data.data.length, total: data.data.length, totalPages: 1 },
	};
}

export async function getVehicleById(id: number): Promise<ApiResponse<Vehicle>> {
	const { data } = await apiClient.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
	return data;
}

export async function createVehicle(payload: Omit<Vehicle, "id">): Promise<ApiResponse<Vehicle>> {
	const { data } = await apiClient.post<ApiResponse<Vehicle>>("/vehicles", payload);
	return data;
}

export async function updateVehicle(payload: Partial<Vehicle> & { id: number }): Promise<ApiResponse<Vehicle>> {
	const { id, ...rest } = payload;
	const { data } = await apiClient.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, rest);
	return data;
}

export async function deleteVehicle(id: number): Promise<{ success: true; data: { id: number } }> {
	const { data } = await apiClient.delete<{ success: true; data: { id: number } }>(`/vehicles/${id}`);
	return data;
}

export function getVehiclesMockStore(): Vehicle[] { return []; }
export function resetVehiclesMockStore(_items: Vehicle[]): void {}
export function resetVehiclesToDefaults(): void {}
