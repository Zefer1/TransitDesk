import type { Guide } from "../types/service.types";
import type { ApiResponse, PaginatedApiResponse } from "../types/api.types";
import apiClient from "../lib/apiClient";

export async function listGuides(): Promise<PaginatedApiResponse<Guide>> {
	const { data } = await apiClient.get<{ success: true; data: Guide[] }>("/guides");
	return {
		success: true,
		data: data.data,
		pagination: { page: 1, pageSize: data.data.length, total: data.data.length, totalPages: 1 },
	};
}

export async function getGuideById(id: number): Promise<ApiResponse<Guide>> {
	const { data } = await apiClient.get<ApiResponse<Guide>>(`/guides/${id}`);
	return data;
}

export async function createGuide(payload: Omit<Guide, "id">): Promise<ApiResponse<Guide>> {
	const { data } = await apiClient.post<ApiResponse<Guide>>("/guides", payload);
	return data;
}

export async function updateGuide(payload: Partial<Guide> & { id: number }): Promise<ApiResponse<Guide>> {
	const { id, ...rest } = payload;
	const { data } = await apiClient.put<ApiResponse<Guide>>(`/guides/${id}`, rest);
	return data;
}

export async function deleteGuide(id: number): Promise<{ success: true; data: { id: number } }> {
	const { data } = await apiClient.delete<{ success: true; data: { id: number } }>(`/guides/${id}`);
	return data;
}
