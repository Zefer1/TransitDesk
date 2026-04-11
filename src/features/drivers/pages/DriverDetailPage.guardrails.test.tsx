/**
 * DriverDetailPage.guardrails.test.tsx
 *
 * Integration tests for the delete-safety guardrails on the DriverDetailPage.
 * These tests verify three critical behaviors:
 *   1. The delete button is disabled when the driver has active service assignments.
 *   2. Deletion proceeds and navigates to the list when no active assignments exist.
 *   3. Deletion is aborted at confirmation time if a new assignment appears between
 *      the initial check and the user clicking "confirm" (race condition guardrail).
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "../../../components/Toast";
import { getDriverById, deleteDriver } from "../../../api/drivers.api";
import { listServices } from "../../../api/services.api";
import { DriverDetailPage } from "./DriverDetailPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

vi.mock("../../../api/drivers.api", () => ({
	listDrivers: vi.fn(),
	getDriverById: vi.fn(),
	createDriver: vi.fn(),
	updateDriver: vi.fn(),
	deleteDriver: vi.fn(),
	getDriversMockStore: vi.fn(),
	resetDriversMockStore: vi.fn(),
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

const MOCK_DRIVER = {
	id: 42,
	name: "Joao Silva",
	gender: "Male" as const,
	license: "D" as const,
	entitledToDrive: "Van" as const,
	phone: "+351910000000",
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

const EMPTY_LIST_RESPONSE = {
	success: true as const,
	data: [],
	pagination: { page: 1, pageSize: 0, total: 0, totalPages: 1 },
};

function renderDriverDetail() {
	return render(
		<ToastProvider>
			<MemoryRouter initialEntries={["/drivers/42"]}>
				<Routes>
					<Route path="/drivers/:id" element={<DriverDetailPage />} />
					<Route path="/drivers" element={<div>Drivers list page</div>} />
				</Routes>
			</MemoryRouter>
		</ToastProvider>,
	);
}

describe("DriverDetailPage - delete guardrails", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockNavigate.mockReset();
		vi.mocked(getDriverById).mockResolvedValue({ success: true, data: MOCK_DRIVER });
	});

	it("disables the delete button when the driver has an active service assignment", async () => {
		vi.mocked(listServices).mockResolvedValue({
			success: true,
			data: [
				{
					id: 1,
					scheduledAt: new Date(Date.now() + 3_600_000).toISOString(),
					description: "Funchal to Santana",
					stops: ["Funchal", "Santana"],
					status: "scheduled",
					type: "Tour",
					vehicle: MOCK_VEHICLE,
					driver: MOCK_DRIVER,
				},
			],
			pagination: { page: 1, pageSize: 1, total: 1, totalPages: 1 },
		});

		renderDriverDetail();
		await screen.findByRole("heading", { level: 1, name: /joao silva/i });

		await waitFor(() => {
			const deleteBtn = screen.getByRole("button", { name: /delete driver/i });
			expect(deleteBtn).toBeDisabled();
			expect(deleteBtn).toHaveAttribute("title", expect.stringContaining("active service assignment"));
		});
	});

	it("allows delete and navigates to the drivers list when no active assignments exist", async () => {
		vi.mocked(listServices).mockResolvedValue(EMPTY_LIST_RESPONSE);
		vi.mocked(deleteDriver).mockResolvedValue({ success: true, data: { id: 42 } });

		renderDriverDetail();
		await screen.findByRole("heading", { level: 1, name: /joao silva/i });

		await waitFor(() => {
			expect(screen.getByRole("button", { name: /delete driver/i })).not.toBeDisabled();
		});

		fireEvent.click(screen.getByRole("button", { name: /delete driver/i }));

		const dialog = await screen.findByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: /delete driver/i });
		expect(confirmBtn).not.toBeDisabled();

		fireEvent.click(confirmBtn);

		await waitFor(() => {
			expect(vi.mocked(deleteDriver)).toHaveBeenCalledWith(42);
		});
		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/drivers");
		});
	});

	it("aborts delete at confirmation when an assignment appears between check and confirm", async () => {
		vi.mocked(listServices)
			.mockResolvedValueOnce(EMPTY_LIST_RESPONSE) // initial assignment check → button enabled
			.mockResolvedValueOnce({
				// fail-safe re-check inside handleDelete
				success: true,
				data: [
					{
						id: 1,
						scheduledAt: new Date(Date.now() + 3_600_000).toISOString(),
						description: "Funchal to Santana",
						stops: ["Funchal", "Santana"],
						status: "scheduled",
						type: "Tour",
						vehicle: MOCK_VEHICLE,
						driver: MOCK_DRIVER,
					},
				],
				pagination: { page: 1, pageSize: 1, total: 1, totalPages: 1 },
			});
		vi.mocked(deleteDriver).mockResolvedValue({ success: true, data: { id: 42 } });

		renderDriverDetail();
		await screen.findByRole("heading", { level: 1, name: /joao silva/i });

		await waitFor(() => {
			expect(screen.getByRole("button", { name: /delete driver/i })).not.toBeDisabled();
		});

		fireEvent.click(screen.getByRole("button", { name: /delete driver/i }));

		const dialog = await screen.findByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: /delete driver/i });
		fireEvent.click(confirmBtn);

		await waitFor(() => {
			expect(vi.mocked(deleteDriver)).not.toHaveBeenCalled();
			expect(within(dialog).getByRole("button", { name: /delete driver/i })).toBeDisabled();
		});
	});
});



