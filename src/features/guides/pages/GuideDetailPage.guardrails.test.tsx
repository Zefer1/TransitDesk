/**
 * GuideDetailPage.guardrails.test.tsx
 *
 * Integration tests for the delete-safety guardrails on the guide detail page.
 * These tests verify that:
 *   1. The delete button is disabled when the guide has active service assignments.
 *   2. Deletion proceeds and navigates to the list when no active assignments exist.
 *   3. A race-condition safeguard works: if an assignment appears between the
 *      initial check and the confirmation click, the delete is aborted.
 *
 * All API calls (guides and services) are mocked via vi.mock so no real
 * network requests are made.
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "../../../components/Toast";
import { getGuideById, deleteGuide } from "../../../api/guides.api";
import { listServices } from "../../../api/services.api";
import { GuideDetailPage } from "./GuideDetailPage";

vi.mock("../../../api/guides.api", () => ({
	listGuides: vi.fn(),
	getGuideById: vi.fn(),
	createGuide: vi.fn(),
	updateGuide: vi.fn(),
	deleteGuide: vi.fn(),
	getGuidesMockStore: vi.fn(),
	resetGuidesMockStore: vi.fn(),
}));

vi.mock("../../../api/services.api", () => ({
	listServices: vi.fn(),
	getServiceById: vi.fn(),
	createService: vi.fn(),
	updateService: vi.fn(),
	deleteService: vi.fn(),
	setServiceStatus: vi.fn(),
	getServicesMockStore: vi.fn(),
	resetServicesMockStore: vi.fn(),
}));

const MOCK_GUIDE = {
	id: 42,
	name: "Test Guide",
	gender: "Female" as const,
	languages: ["English", "Portuguese"],
};

const MOCK_VEHICLE = {
	id: 1,
	licensePlate: "AA-12-BB",
	brand: "Mercedes",
	model: "Sprinter",
	year: 2022,
	passengerCapacity: 16,
	type: "Van" as const,
	color: "White",
};

const MOCK_DRIVER = {
	id: 1,
	name: "Joao Silva",
	gender: "Male" as const,
	license: "D" as const,
	entitledToDrive: "Van" as const,
};

const EMPTY_LIST_RESPONSE = {
	success: true as const,
	data: [],
	pagination: { page: 1, pageSize: 0, total: 0, totalPages: 1 },
};

const ACTIVE_SERVICE_WITH_GUIDE = {
	id: 1,
	scheduledAt: new Date(Date.now() + 3_600_000).toISOString(),
	description: "Levada Walk",
	stops: ["Funchal", "Ribeiro Frio"],
	status: "scheduled" as const,
	type: "Levada" as const,
	vehicle: MOCK_VEHICLE,
	driver: MOCK_DRIVER,
	guide: MOCK_GUIDE,
};

function renderGuideDetail() {
	return render(
		<ToastProvider>
			<MemoryRouter initialEntries={["/guides/42"]}>
				<Routes>
					<Route path="/guides/:id" element={<GuideDetailPage />} />
					<Route path="/guides" element={<div>Guides list page</div>} />
				</Routes>
			</MemoryRouter>
		</ToastProvider>,
	);
}

describe("GuideDetailPage - delete guardrails", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(getGuideById).mockResolvedValue({ success: true, data: MOCK_GUIDE });
	});

	it("disables the delete button when the guide has an active service assignment", async () => {
		vi.mocked(listServices).mockResolvedValue({
			success: true,
			data: [ACTIVE_SERVICE_WITH_GUIDE],
			pagination: { page: 1, pageSize: 1, total: 1, totalPages: 1 },
		});

		renderGuideDetail();
		await screen.findByRole("heading", { level: 1, name: /test guide/i });

		await waitFor(() => {
			const deleteBtn = screen.getByRole("button", { name: /delete guide/i });
			expect(deleteBtn).toBeDisabled();
			expect(deleteBtn).toHaveAttribute("title", expect.stringContaining("active service assignment"));
		});
	});

	it("allows delete and navigates to the guides list when no active assignments exist", async () => {
		vi.mocked(listServices).mockResolvedValue(EMPTY_LIST_RESPONSE);
		vi.mocked(deleteGuide).mockResolvedValue({ success: true, data: { id: 42 } });

		renderGuideDetail();
		await screen.findByRole("heading", { level: 1, name: /test guide/i });

		await waitFor(() => {
			expect(screen.getByRole("button", { name: /delete guide/i })).not.toBeDisabled();
		});

		fireEvent.click(screen.getByRole("button", { name: /delete guide/i }));

		const dialog = screen.getByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: /delete guide/i });
		expect(confirmBtn).not.toBeDisabled();

		fireEvent.click(confirmBtn);

		await waitFor(() => {
			expect(vi.mocked(deleteGuide)).toHaveBeenCalledWith(42);
		});
		await screen.findByText("Guides list page");
	});

	it("aborts delete at confirmation when an assignment appears between check and confirm", async () => {
		vi.mocked(listServices)
			.mockResolvedValueOnce(EMPTY_LIST_RESPONSE) // initial assignment check → button enabled
			.mockResolvedValueOnce({
				// fail-safe re-check inside handleDelete
				success: true,
				data: [ACTIVE_SERVICE_WITH_GUIDE],
				pagination: { page: 1, pageSize: 1, total: 1, totalPages: 1 },
			});
		vi.mocked(deleteGuide).mockResolvedValue({ success: true, data: { id: 42 } });

		renderGuideDetail();
		await screen.findByRole("heading", { level: 1, name: /test guide/i });

		await waitFor(() => {
			expect(screen.getByRole("button", { name: /delete guide/i })).not.toBeDisabled();
		});

		fireEvent.click(screen.getByRole("button", { name: /delete guide/i }));

		const dialog = screen.getByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: /delete guide/i });
		fireEvent.click(confirmBtn);

		await waitFor(() => {
			expect(vi.mocked(deleteGuide)).not.toHaveBeenCalled();
			expect(within(dialog).getByRole("button", { name: /delete guide/i })).toBeDisabled();
		});
	});
});



