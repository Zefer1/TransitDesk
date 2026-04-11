/**
 * DriverForm.tsx
 *
 * A reusable form for both creating and editing drivers. It works in two modes:
 *   - "create" mode: all fields start empty, and the create schema is used for validation.
 *   - "edit" mode:   fields are pre-filled with the existing driver data, and the update
 *                    schema is used (which also requires the driver's ID).
 *
 * When the user submits the form, the component:
 *   1. Picks the right Zod schema based on the mode.
 *   2. Validates the form data against that schema.
 *   3. If validation passes, calls the onSubmit callback with the clean data.
 *   4. If validation fails, shows field-level error messages under each input.
 *
 * The actual API call is NOT done here -- the parent page is responsible for that.
 * This keeps the form component focused purely on collecting and validating input.
 */
import { useState } from "react";
import { z } from "zod";
import { mapZodErrors } from "../../../lib/mapZodErrors";

import {
	CrudForm,
	CrudFormActions,
	CrudFormSection,
	CrudSelectInput,
	CrudTextInput,
} from "../../../components/CrudFormPrimitives";
import { DRIVER_LICENSES, GENDERS, VEHICLE_TYPES } from "../../../constants/enums";
import { driverCreateSchema, driverUpdateSchema } from "../schemas/driverForm.schema";
import type { Driver } from "../../../types/service.types";
import type { ValidatedDriverCreateValues, ValidatedDriverUpdateValues } from "../schemas/driverForm.schema";

/** The form can operate in "create" (new driver) or "edit" (existing driver) mode. */
type DriverFormMode = "create" | "edit";

type DriverFormProps = {
	initialData?: Partial<Driver>;
	onSubmit: (values: ValidatedDriverCreateValues | ValidatedDriverUpdateValues) => Promise<void> | void;
	submitLabel?: string;
	isSubmitting?: boolean;
	mode?: DriverFormMode;
	cancelTo: string;
};

/**
 * The shape of the form's internal state. Each field starts as an empty string
 * (for "create" mode) or is pre-filled from the existing driver (for "edit" mode).
 * The union with "" allows select inputs to show a placeholder option.
 */
type DriverFormState = {
	name: string;
	gender: Driver["gender"] | "";
	license: Driver["license"] | "";
	entitledToDrive: Driver["entitledToDrive"] | "";
	phone: string;
};

/** A simple map of field name to error message, used to display inline errors. */
type DriverFormErrors = Record<string, string>;

/** Builds the starting values for the form. Uses provided data or falls back to empty strings. */
function buildInitialState(initialData?: Partial<Driver>): DriverFormState {
	return {
		name: initialData?.name ?? "",
		gender: initialData?.gender ?? "",
		license: initialData?.license ?? "",
		entitledToDrive: initialData?.entitledToDrive ?? "",
		phone: initialData?.phone ?? "",
	};
}


export function DriverForm({
	initialData,
	onSubmit,
	submitLabel = "Save Driver",
	isSubmitting = false,
	mode = "create",
	cancelTo,
}: DriverFormProps) {
	const [formState, setFormState] = useState<DriverFormState>(buildInitialState(initialData));
	const [errors, setErrors] = useState<DriverFormErrors>({});

	/**
	 * Handles form submission. The steps are:
	 *   1. Pick the right Zod schema depending on whether we are creating or editing.
	 *   2. In edit mode, attach the driver's existing ID to the data before validating.
	 *   3. Run Zod validation -- if it fails, display field-level error messages.
	 *   4. If it passes, hand the validated data up to the parent via onSubmit.
	 */
	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrors({});

		try {
			// Choose the correct schema for the current mode
			const schema = mode === "edit" && initialData?.id
				? driverUpdateSchema
				: driverCreateSchema;

			// In edit mode we need the driver ID so the update schema can validate it
			const dataToValidate = mode === "edit" && initialData?.id
				? { ...formState, id: initialData.id }
				: formState;

			const validatedData = schema.parse(dataToValidate);
			await onSubmit(validatedData);
		} catch (error) {
			if (error instanceof z.ZodError) {
				// Turn Zod's array of issues into a simple { fieldName: message } map
				setErrors(mapZodErrors(error));
			} else {
				// Unexpected errors (e.g. network failures from the parent's onSubmit)
				const message = error instanceof Error ? error.message : "An error occurred";
				setErrors({ submit: message });
			}
		}
	}

	return (
		<CrudForm onSubmit={handleSubmit}>
			{/* Main identity + qualification fields used in service assignment checks. */}
			<CrudFormSection 
				title="Driver Details" 
				description="Provide driver information including license and vehicle eligibility."
			>
				<div className="grid gap-4 md:grid-cols-2">
					<CrudTextInput
						label="Full Name"
						value={formState.name}
						onChange={(value) => setFormState((current) => ({ ...current, name: value }))}
						error={errors.name}
						required
						autoComplete="name"
						placeholder="John Doe"
						disabled={isSubmitting}
					/>

					<CrudSelectInput
						label="Gender"
						value={formState.gender}
						onChange={(value) =>
							setFormState((current) => ({ ...current, gender: value as Driver["gender"] | "" }))
						}
						error={errors.gender}
						required
						options={GENDERS.map((g) => ({ value: g, label: g }))}
						placeholder="Select gender"
						disabled={isSubmitting}
					/>

					<CrudSelectInput
						label="License Type"
						value={formState.license}
						onChange={(value) =>
							setFormState((current) => ({ ...current, license: value as Driver["license"] | "" }))
						}
						error={errors.license}
						required
						options={DRIVER_LICENSES.map((l) => ({ value: l, label: l }))}
						placeholder="Select license"
						disabled={isSubmitting}
					/>

					<CrudSelectInput
						label="Entitled to Drive"
						value={formState.entitledToDrive}
						onChange={(value) =>
							setFormState((current) => ({
								...current,
								entitledToDrive: value as Driver["entitledToDrive"] | "",
							}))
						}
						error={errors.entitledToDrive}
						required
						options={VEHICLE_TYPES.map((v) => ({ value: v, label: v }))}
						placeholder="Select vehicle type"
						disabled={isSubmitting}
					/>

					<CrudTextInput
						label="Phone"
						value={formState.phone}
						onChange={(value) => setFormState((current) => ({ ...current, phone: value }))}
						error={errors.phone}
						type="tel"
						autoComplete="tel"
						placeholder="+1 555 000 0000"
						disabled={isSubmitting}
					/>
				</div>
			</CrudFormSection>

			{/* Form-level API/unknown errors are shown here. */}
			{errors.submit && (
				<div
					className="mb-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400"
					role="alert"
				>
					{errors.submit}
				</div>
			)}

			<CrudFormActions
				submitLabel={submitLabel}
				cancelTo={cancelTo}
				isSubmitting={isSubmitting}
			/>
		</CrudForm>
	);
}



