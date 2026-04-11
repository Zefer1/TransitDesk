/**
 * VehicleForm.test.tsx
 *
 * Unit tests for the VehicleForm component. Verifies that:
 *   - Zod validation errors are shown and submission is blocked when required fields are empty
 *   - A fully filled-out form produces a valid create payload and calls onSubmit
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { VehicleForm } from "./VehicleForm";

describe("VehicleForm", () => {
	it("shows validation errors and blocks submit when required fields are missing", async () => {
		const onSubmit = vi.fn();
		render(
			<MemoryRouter>
				<VehicleForm onSubmit={onSubmit} cancelTo="/vehicles" />
			</MemoryRouter>,
		);

		fireEvent.click(screen.getByRole("button", { name: /save vehicle/i }));

		expect(await screen.findByText("License plate is required")).toBeInTheDocument();
		expect(screen.getByText("Vehicle type is required")).toBeInTheDocument();
		expect(screen.getByText("Brand is required")).toBeInTheDocument();
		expect(screen.getByText("Passenger capacity must be greater than 0")).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("submits valid create payload", async () => {
		const onSubmit = vi.fn();
		render(
			<MemoryRouter>
				<VehicleForm onSubmit={onSubmit} cancelTo="/vehicles" />
			</MemoryRouter>,
		);

		fireEvent.change(screen.getByLabelText(/license plate/i), { target: { value: "AA-12-BB" } });
		fireEvent.change(screen.getByLabelText(/type/i), { target: { value: "Van" } });
		fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: "Mercedes" } });
		fireEvent.change(screen.getByLabelText(/model/i), { target: { value: "Sprinter" } });
		fireEvent.change(screen.getByLabelText(/color/i), { target: { value: "White" } });
		fireEvent.change(screen.getByLabelText(/year/i), { target: { value: "2023" } });
		fireEvent.change(screen.getByLabelText(/passenger capacity/i), { target: { value: "16" } });
		fireEvent.change(screen.getByLabelText(/suited for/i), { target: { value: "Tour" } });

		fireEvent.click(screen.getByRole("button", { name: /save vehicle/i }));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledTimes(1);
		});

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				licensePlate: "AA-12-BB",
				type: "Van",
				brand: "Mercedes",
				model: "Sprinter",
				year: 2023,
				passengerCapacity: 16,
			}),
		);
	});
});



