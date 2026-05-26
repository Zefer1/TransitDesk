import type { Service, ServiceStatus } from "../types/service.types";
import type { ApiResponse, PaginatedApiResponse } from "../types/api.types";
import apiClient from "../lib/apiClient";

export async function listServices(): Promise<PaginatedApiResponse<Service>> {
	const { data } = await apiClient.get<{ success: true; data: Service[] }>("/services");
	return {
		success: true,
		data: data.data,
		pagination: { page: 1, pageSize: data.data.length, total: data.data.length, totalPages: 1 },
	};
}

export async function getServiceById(id: number): Promise<ApiResponse<Service>> {
	const { data } = await apiClient.get<ApiResponse<Service>>(`/services/${id}`);
	return data;
}

export async function createService(payload: Omit<Service, "id">): Promise<ApiResponse<Service>> {
	const { vehicle, driver, guide, ...rest } = payload;
	const { data } = await apiClient.post<ApiResponse<Service>>("/services", {
		...rest,
		vehicle,
		driver,
		guide,
	});
	return data;
}

export async function updateService(payload: Partial<Service> & { id: number }): Promise<ApiResponse<Service>> {
	const { id, vehicle, driver, guide, ...rest } = payload;
	const { data } = await apiClient.put<ApiResponse<Service>>(`/services/${id}`, {
		...rest,
		...(vehicle !== undefined && { vehicle }),
		...(driver !== undefined && { driver }),
		...(guide !== undefined && { guide }),
	});
	return data;
}

export async function deleteService(id: number): Promise<{ success: true; data: { id: number } }> {
	const { data } = await apiClient.delete<{ success: true; data: { id: number } }>(`/services/${id}`);
	return data;
}

export async function setServiceStatus(id: number, status: ServiceStatus): Promise<ApiResponse<Service>> {
	const { data } = await apiClient.patch<ApiResponse<Service>>(`/services/${id}/status`, { status });
	return data;
}

export function getServicesMockStore(): Service[] { return []; }
export function resetServicesMockStore(_services: Service[]): void {}
export function resetServicesToDefaults(): void {}
