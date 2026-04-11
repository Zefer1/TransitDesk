/**
 * ServiceForm.test.tsx
 *
 * Integration tests for the ServiceForm component.
 * Covers form validation (required field errors on empty submit),
 * submit button behavior, and a full happy-path submission with valid input.
 *
 * The vehicle, driver, and guide API modules are mocked to return empty lists
 * so the assignment dropdowns are disabled and manual field entry is used instead.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ServiceForm } from "./ServiceForm";

vi.mock("../../../api/vehicles.api", () => ({
	listVehicles: vi.fn(async () => ({
		success: true,
		data: [],
		pagination: { page: 1, pageSize: 0, total: 0, totalPages: 1 },
	})),
}));

vi.mock("../../../api/drivers.api", () => ({
	listDrivers: vi.fn(async () => ({
		success: true,
		data: [],
		pagination: { page: 1, pageSize: 0, total: 0, totalPages: 1 },
	})),
}));

vi.mock("../../../api/guides.api", () => ({
	listGuides: vi.fn(async () => ({
		success: true,
		data: [],
		pagination: { page: 1, pageSize: 0, total: 0, totalPages: 1 },
	})),
}));

function futureDateTimeLocal(daysAhead = 1): string {
	const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
	return date.toISOString().slice(0, 16);
}

function fillRequiredFields() {
	fireEvent.change(screen.getByLabelText("Scheduled time"), {
		target: { value: futureDateTimeLocal() },
	});
	fireEvent.change(screen.getByLabelText("Service type"), {
		target: { value: "Tour" },
	});
	fireEvent.change(screen.getByLabelText("Passenger quantity"), {
		target: { value: "10" },
	});
	fireEvent.change(screen.getByLabelText("Description"), {
		target: { value: "Funchal to Santana" },
	});
	fireEvent.change(screen.getByLabelText("Stop 1"), {
		target: { value: "Funchal" },
	});

	fireEvent.change(screen.getByLabelText("Vehicle ID"), {
		target: { value: "1" },
	});
	fireEvent.change(screen.getByLabelText("License plate"), {
		target: { value: "AA-12-BB" },
	});
	fireEvent.change(screen.getByLabelText("Brand"), {
		target: { value: "Mercedes" },
	});
	fireEvent.change(screen.getByLabelText("Model"), {
		target: { value: "Sprinter" },
	});
	fireEvent.change(screen.getByLabelText("Year"), {
		target: { value: "2022" },
	});
	fireEvent.change(screen.getByLabelText("Passenger capacity"), {
		target: { value: "16" },
	});
	fireEvent.change(screen.getByLabelText("Vehicle type"), {
		target: { value: "Van" },
	});
	fireEvent.change(screen.getByLabelText("Color"), {
		target: { value: "White" },
	});

	fireEvent.change(screen.getByLabelText("Driver ID"), {
		target: { value: "1" },
	});
	fireEvent.change(screen.getByLabelText("Driver name"), {
		target: { value: "Joao Silva" },
	});
	fireEvent.change(screen.getByLabelText("Gender"), {
		target: { value: "Male" },
	});
	fireEvent.change(screen.getByLabelText("License"), {
		target: { value: "D" },
	});
	fireEvent.change(screen.getByLabelText("Entitled vehicle type"), {
		target: { value: "Van" },
	});
}

describe("ServiceForm validation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("shows field-level errors and blocks submit when required values are missing", async () => {
		const onSubmit = vi.fn();
		const { container } = render(<ServiceForm onSubmit={onSubmit} />);

		const form = container.querySelector("form");
		expect(form).not.toBeNull();
		fireEvent.submit(form as HTMLFormElement);

		expect(await screen.findByText("Scheduled time is required")).toBeInTheDocument();
		expect(screen.getByText("Description is required")).toBeInTheDocument();
		expect(screen.getAllByText("Vehicle is required").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Driver is required").length).toBeGreaterThan(0);
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("submit button is always enabled and shows errors on submit when form is invalid", async () => {
		render(<ServiceForm onSubmit={vi.fn()} />);

		const submitButton = screen.getByRole("button", { name: /save service/i });
		expect(submitButton).toBeEnabled();

		fireEvent.click(submitButton);

		expect(await screen.findByText("Scheduled time is required")).toBeInTheDocument();
	});

	it("submits successfully with valid input", async () => {
		const onSubmit = vi.fn();
		render(<ServiceForm onSubmit={onSubmit} />);

		fillRequiredFields();

		const submitButton = screen.getByRole("button", { name: /save service/i });
		await waitFor(() => {
			expect(submitButton).toBeEnabled();
		});

		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledTimes(1);
		});

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				description: "Funchal to Santana",
				type: "Tour",
				passengerQuantity: 10,
				vehicle: expect.objectContaining({
					id: 1,
					licensePlate: "AA-12-BB",
				}),
				driver: expect.objectContaining({
					id: 1,
					name: "Joao Silva",
				}),
			}),
		);
	});
});



