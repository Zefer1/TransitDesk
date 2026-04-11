/**
 * Mock API for Guides.
 *
 * Same pattern as drivers.api.ts and vehicles.api.ts -- an in-memory array
 * acts as a fake database, and every function adds a short delay to simulate
 * network latency. Replace these with real Axios calls when the backend is ready.
 */
import type { Guide } from "../types/service.types";
import type { ApiResponse, PaginatedApiResponse } from "../types/api.types";
import { mockDelay } from "./mockDelay";

/** Seed data -- the guides that exist when the app first loads. */
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

/** The mutable "database" array. Copied from seed data so we can reset later. */
let guidesStore: Guide[] = [...initialGuides];

/** Returns all guides, wrapped in a paginated response shape. */
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

/** Finds a single guide by its numeric ID. Throws if not found. */
export async function getGuideById(id: number): Promise<ApiResponse<Guide>> {
	await mockDelay();
	const guide = guidesStore.find((item) => item.id === id);
	if (!guide) {
		throw new Error(`Guide with id ${id} not found`);
	}
	return { success: true, data: guide };
}

/** Creates a new guide. Auto-generates an ID by taking the highest existing ID + 1. */
export async function createGuide(payload: Omit<Guide, "id">): Promise<ApiResponse<Guide>> {
	await mockDelay();
	const id = guidesStore.length ? Math.max(...guidesStore.map((item) => item.id)) + 1 : 1;
	const created = { id, ...payload } as Guide;
	guidesStore = [created, ...guidesStore];
	return { success: true, data: created };
}

/** Updates an existing guide by merging the provided fields into the stored record. */
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

/** Removes a guide from the store by filtering it out. */
export async function deleteGuide(id: number): Promise<{ success: true; data: { id: number } }> {
	await mockDelay();
	guidesStore = guidesStore.filter((item) => item.id !== id);
	return { success: true, data: { id } };
}

/** Exposes the raw mock store for use in tests or debugging. */
export function getGuidesMockStore(): Guide[] {
	return guidesStore;
}

/** Replaces the entire mock store -- useful for resetting state in tests. */
export function resetGuidesMockStore(items: Guide[]): void {
	guidesStore = items;
}

/** Restores the mock store to the original seed data. */
export function resetGuidesToDefaults(): void {
	resetGuidesMockStore([...initialGuides]);
}
