/**
 * GuideForm.test.tsx
 *
 * Unit tests for the GuideForm component. Covers two main scenarios:
 *   1. Validation gating -- submitting with empty required fields shows
 *      inline error messages and prevents the onSubmit callback from firing.
 *   2. Dynamic language list -- adding and removing language rows works
 *      correctly, and a valid create payload is forwarded to onSubmit.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { GuideForm } from "./GuideForm";

describe("GuideForm", () => {
	it("shows validation errors and blocks submit when required fields are missing", async () => {
		const onSubmit = vi.fn();
		render(
			<MemoryRouter>
				<GuideForm onSubmit={onSubmit} cancelTo="/guides" />
			</MemoryRouter>,
		);

		fireEvent.change(screen.getByLabelText("Language 1"), { target: { value: "" } });
		fireEvent.click(screen.getByRole("button", { name: /save guide/i }));

		expect(await screen.findByText("Guide name is required")).toBeInTheDocument();
		expect(screen.getByText("Guide gender is required")).toBeInTheDocument();
		expect(screen.getByText("Guide language is required")).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("supports language add/remove and submits valid create payload", async () => {
		const onSubmit = vi.fn();
		render(
			<MemoryRouter>
				<GuideForm onSubmit={onSubmit} cancelTo="/guides" />
			</MemoryRouter>,
		);

		fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Maria Santos" } });
		fireEvent.change(screen.getByLabelText(/gender/i), { target: { value: "Female" } });
		fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: "+351910000200" } });
		fireEvent.change(screen.getByLabelText(/language 1/i), { target: { value: "Portuguese" } });

		fireEvent.click(screen.getByRole("button", { name: /add language/i }));
		fireEvent.change(screen.getByRole("textbox", { name: /language 2/i }), { target: { value: "English" } });
		fireEvent.click(screen.getByRole("button", { name: /remove language 2/i }));

		fireEvent.click(screen.getByRole("button", { name: /save guide/i }));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledTimes(1);
		});

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "Maria Santos",
				gender: "Female",
				phone: "+351910000200",
				languages: ["Portuguese"],
			}),
		);
	});
});



