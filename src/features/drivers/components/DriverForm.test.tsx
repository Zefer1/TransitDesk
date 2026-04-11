/**
 * DriverForm.test.tsx
 *
 * Unit tests for the DriverForm component. Covers two main scenarios:
 *   - Submitting with empty required fields shows validation errors and blocks the submit callback.
 *   - Filling all fields with valid data and submitting calls onSubmit with the correct payload.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { DriverForm } from "./DriverForm";

describe("DriverForm", () => {
	it("shows validation errors and blocks submit when required fields are missing", async () => {
		const onSubmit = vi.fn();
		render(
			<MemoryRouter>
				<DriverForm onSubmit={onSubmit} cancelTo="/drivers" />
			</MemoryRouter>,
		);

		fireEvent.click(screen.getByRole("button", { name: /save driver/i }));

		expect(await screen.findByText("Driver name is required")).toBeInTheDocument();
		expect(screen.getByText("Driver gender is required")).toBeInTheDocument();
		expect(screen.getByText("Driver license is required")).toBeInTheDocument();
		expect(screen.getByText("Driver entitlement is required")).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("submits valid create payload", async () => {
		const onSubmit = vi.fn();
		render(
			<MemoryRouter>
				<DriverForm onSubmit={onSubmit} cancelTo="/drivers" />
			</MemoryRouter>,
		);

		fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Joao Silva" } });
		fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: "Male" } });
		fireEvent.change(screen.getByLabelText(/license type/i), { target: { value: "D" } });
		fireEvent.change(screen.getByLabelText(/entitled to drive/i), { target: { value: "Van" } });
		fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: "+351910000100" } });

		fireEvent.click(screen.getByRole("button", { name: /save driver/i }));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledTimes(1);
		});

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "Joao Silva",
				gender: "Male",
				license: "D",
				entitledToDrive: "Van",
				phone: "+351910000100",
			}),
		);
	});
});



