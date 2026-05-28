/**
 * VehicleDetailPage.guardrails.test.tsx
 *
 * Integration tests for the delete guardrail logic on the Vehicle detail page.
 * Ensures that:
 *   - The delete button is disabled when the vehicle has active service assignments
 *   - Deletion proceeds normally when no active assignments exist
 *   - A race condition (assignment appears between initial check and confirm) is
 *     caught by the fail-safe re-check, aborting the delete
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "../../../components/Toast";
import { getVehicleById, deleteVehicle } from "../../../api/vehicles.api";
import { listServices } from "../../../api/services.api";
import { VehicleDetailPage } from "./VehicleDetailPage";

vi.mock("../../../api/vehicles.api", () => ({
	listVehicles: vi.fn(),
	getVehicleById: vi.fn(),
	createVehicle: vi.fn(),
	updateVehicle: vi.fn(),
	deleteVehicle: vi.fn(),
}));

vi.mock("../../../api/services.api", () => ({
	listServices: vi.fn(),
	getServiceById: vi.fn(),
	createService: vi.fn(),
	updateService: vi.fn(),
	deleteService: vi.fn(),
	setServiceStatus: vi.fn(),
}));

const MOCK_VEHICLE = {
	id: 42,
	licensePlate: "TEST-42",
	brand: "Mercedes",
	model: "Sprinter",
	year: 2022,
	passengerCapacity: 16,
	type: "Van" as const,
	color: "White",
	active: true,
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

const ACTIVE_SERVICE_WITH_VEHICLE = {
	id: 1,
	scheduledAt: new Date(Date.now() + 3_600_000).toISOString(),
	description: "Funchal to Santana",
	stops: ["Funchal", "Santana"],
	status: "scheduled" as const,
	type: "Tour" as const,
	vehicle: MOCK_VEHICLE,
	driver: MOCK_DRIVER,
};

function renderVehicleDetail() {
	return render(
		<ToastProvider>
			<MemoryRouter initialEntries={["/vehicles/42"]}>
				<Routes>
					<Route path="/vehicles/:id" element={<VehicleDetailPage />} />
					<Route path="/vehicles" element={<div>Vehicles list page</div>} />
				</Routes>
			</MemoryRouter>
		</ToastProvider>,
	);
}

describe("VehicleDetailPage - delete guardrails", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(getVehicleById).mockResolvedValue({ success: true, data: MOCK_VEHICLE });
	});

	it("disables the delete button when the vehicle has an active service assignment", async () => {
		vi.mocked(listServices).mockResolvedValue({
			success: true,
			data: [ACTIVE_SERVICE_WITH_VEHICLE],
			pagination: { page: 1, pageSize: 1, total: 1, totalPages: 1 },
		});

		renderVehicleDetail();
		await screen.findByText("TEST-42");

		await waitFor(() => {
			const deleteBtn = screen.getByRole("button", { name: /delete vehicle/i });
			expect(deleteBtn).toBeDisabled();
			expect(deleteBtn).toHaveAttribute("title", expect.stringContaining("active service assignment"));
		});
	});

	it("allows delete and navigates to the vehicles list when no active assignments exist", async () => {
		vi.mocked(listServices).mockResolvedValue(EMPTY_LIST_RESPONSE);
		vi.mocked(deleteVehicle).mockResolvedValue({ success: true, data: { id: 42 } });

		renderVehicleDetail();
		await screen.findByText("TEST-42");

		await waitFor(() => {
			expect(screen.getByRole("button", { name: /delete vehicle/i })).not.toBeDisabled();
		});

		fireEvent.click(screen.getByRole("button", { name: /delete vehicle/i }));

		const dialog = screen.getByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: /delete vehicle/i });
		expect(confirmBtn).not.toBeDisabled();

		fireEvent.click(confirmBtn);

		await waitFor(() => {
			expect(vi.mocked(deleteVehicle)).toHaveBeenCalledWith(42);
		});
		await screen.findByText("Vehicles list page");
	});

	it("aborts delete at confirmation when an assignment appears between check and confirm", async () => {
		vi.mocked(listServices)
			.mockResolvedValueOnce(EMPTY_LIST_RESPONSE) // initial assignment check → button enabled
			.mockResolvedValueOnce({
				// fail-safe re-check inside handleDelete
				success: true,
				data: [ACTIVE_SERVICE_WITH_VEHICLE],
				pagination: { page: 1, pageSize: 1, total: 1, totalPages: 1 },
			});
		vi.mocked(deleteVehicle).mockResolvedValue({ success: true, data: { id: 42 } });

		renderVehicleDetail();
		await screen.findByText("TEST-42");

		await waitFor(() => {
			expect(screen.getByRole("button", { name: /delete vehicle/i })).not.toBeDisabled();
		});

		fireEvent.click(screen.getByRole("button", { name: /delete vehicle/i }));

		const dialog = screen.getByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: /delete vehicle/i });
		fireEvent.click(confirmBtn);

		await waitFor(() => {
			expect(vi.mocked(deleteVehicle)).not.toHaveBeenCalled();
			expect(within(dialog).getByRole("button", { name: /delete vehicle/i })).toBeDisabled();
		});
	});
});



