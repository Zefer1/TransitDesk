import type { Driver } from "../types/service.types";
import type { ApiResponse, PaginatedApiResponse } from "../types/api.types";
import apiClient from "../lib/apiClient";

export async function listDrivers(): Promise<PaginatedApiResponse<Driver>> {
	const { data } = await apiClient.get<{ success: true; data: Driver[] }>("/drivers");
	return {
		success: true,
		data: data.data,
		pagination: { page: 1, pageSize: data.data.length, total: data.data.length, totalPages: 1 },
	};
}

export async function getDriverById(id: number): Promise<ApiResponse<Driver>> {
	const { data } = await apiClient.get<ApiResponse<Driver>>(`/drivers/${id}`);
	return data;
}

export async function createDriver(payload: Omit<Driver, "id">): Promise<ApiResponse<Driver>> {
	const { data } = await apiClient.post<ApiResponse<Driver>>("/drivers", payload);
	return data;
}

export async function updateDriver(payload: Partial<Driver> & { id: number }): Promise<ApiResponse<Driver>> {
	const { id, ...rest } = payload;
	const { data } = await apiClient.put<ApiResponse<Driver>>(`/drivers/${id}`, rest);
	return data;
}

export async function deleteDriver(id: number): Promise<{ success: true; data: { id: number } }> {
	const { data } = await apiClient.delete<{ success: true; data: { id: number } }>(`/drivers/${id}`);
	return data;
}
