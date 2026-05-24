import type { Guide } from "../types/service.types";
import type { ApiResponse, PaginatedApiResponse } from "../types/api.types";
import { mockDelay } from "./mockDelay";

const initialGuides: Guide[] = [
	{
		id: 1,
		name: "Maria Santos",
		gender: "Female",
		phone: "+351910000100",
		languages: ["Portuguese", "English"],
	},
	{
		id: 2,
		name: "Andre Nunes",
		gender: "Male",
		phone: "+351910000101",
		languages: ["Portuguese", "French"],
	},
];

let guidesStore: Guide[] = [...initialGuides];

export async function listGuides(): Promise<PaginatedApiResponse<Guide>> {
	await mockDelay();
	return {
		success: true,
		data: guidesStore,
		pagination: {
			page: 1,
			pageSize: guidesStore.length,
			total: guidesStore.length,
			totalPages: 1,
		},
	};
}

export async function getGuideById(id: number): Promise<ApiResponse<Guide>> {
	await mockDelay();
	const guide = guidesStore.find((item) => item.id === id);
	if (!guide) {
		throw new Error(`Guide with id ${id} not found`);
	}
	return { success: true, data: guide };
}

export async function createGuide(payload: Omit<Guide, "id">): Promise<ApiResponse<Guide>> {
	await mockDelay();
	const id = guidesStore.length ? Math.max(...guidesStore.map((item) => item.id)) + 1 : 1;
	const created = { id, ...payload } as Guide;
	guidesStore = [created, ...guidesStore];
	return { success: true, data: created };
}

export async function updateGuide(payload: Partial<Guide> & { id: number }): Promise<ApiResponse<Guide>> {
	await mockDelay();
	const index = guidesStore.findIndex((item) => item.id === payload.id);
	if (index < 0) {
		throw new Error(`Guide with id ${payload.id} not found`);
	}
	const updated = { ...guidesStore[index], ...payload } as Guide;
	guidesStore[index] = updated;
	return { success: true, data: updated };
}

export async function deleteGuide(id: number): Promise<{ success: true; data: { id: number } }> {
	await mockDelay();
	guidesStore = guidesStore.filter((item) => item.id !== id);
	return { success: true, data: { id } };
}

export function getGuidesMockStore(): Guide[] {
	return guidesStore;
}

export function resetGuidesMockStore(items: Guide[]): void {
	guidesStore = items;
}

export function resetGuidesToDefaults(): void {
	resetGuidesMockStore([...initialGuides]);
}
