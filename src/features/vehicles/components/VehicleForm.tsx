/**
 * VehicleForm.tsx
 *
 * The shared form used for both creating and editing vehicles.
 * It collects all vehicle fields (plate, brand, model, capacity, etc.),
 * validates them with a Zod schema on submit, and passes the validated
 * data up to the parent page via the onSubmit callback.
 *
 * The form works in two modes:
 *   - "create" mode: all fields start empty, validated with vehicleCreateSchema
 *   - "edit" mode:   fields are pre-filled from initialData, validated with vehicleUpdateSchema
 *
 * Validation errors from Zod are shown inline next to each field.
 * Unexpected errors (like network failures) are shown in a banner at the bottom.
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
import { SERVICE_TYPES, VEHICLE_TYPES } from "../../../constants/enums";
import { vehicleCreateSchema, vehicleUpdateSchema } from "../schemas/vehicleForm.schema";
import type { Vehicle } from "../../../types/service.types";
import type { ValidatedVehicleCreateValues, ValidatedVehicleUpdateValues } from "../schemas/vehicleForm.schema";

/** The form supports two modes: creating a brand-new vehicle or editing an existing one. */
type VehicleFormMode = "create" | "edit";

type VehicleFormProps = {
	initialData?: Partial<Vehicle>;
	onSubmit: (values: ValidatedVehicleCreateValues | ValidatedVehicleUpdateValues) => Promise<void> | void;
	submitLabel?: string;
	isSubmitting?: boolean;
	mode?: VehicleFormMode;
	cancelTo: string;
};

type VehicleFormState = {
	licensePlate: string;
	brand: string;
	model: string;
	year: string;
	passengerCapacity: string;
	type: Vehicle["type"] | "";
	color: string;
	registrationDate: string;
	inspectionExpiry: string;
	active: boolean;
	notes: string;
	suitedFor: "" | (typeof SERVICE_TYPES)[number];
};

type VehicleFormErrors = Record<string, string>;

/**
 * Builds the starting values for the form fields.
 * When editing, it pre-fills values from the existing vehicle data.
 * When creating, everything defaults to empty strings / true.
 *
 * Note: numeric fields like "year" are stored as strings here because
 * HTML inputs always give us strings -- the Zod schema converts them
 * back to numbers during validation.
 */
function buildInitialState(initialData?: Partial<Vehicle>): VehicleFormState {
	return {
		licensePlate: initialData?.licensePlate ?? "",
		brand: initialData?.brand ?? "",
		model: initialData?.model ?? "",
		year: initialData?.year ? String(initialData.year) : "",
		passengerCapacity: initialData?.passengerCapacity ? String(initialData.passengerCapacity) : "",
		type: initialData?.type ?? "",
		color: initialData?.color ?? "",
		registrationDate: initialData?.registrationDate ?? "",
		inspectionExpiry: initialData?.inspectionExpiry ?? "",
		active: initialData?.active ?? true,
		notes: initialData?.notes ?? "",
		suitedFor: initialData?.suitedFor ?? "",
	};
}


export function VehicleForm({
	initialData,
	onSubmit,
	submitLabel = "Save Vehicle",
	isSubmitting = false,
	mode = "create",
	cancelTo,
}: VehicleFormProps) {
	const [formState, setFormState] = useState<VehicleFormState>(buildInitialState(initialData));
	const [errors, setErrors] = useState<VehicleFormErrors>({});

	/**
	 * Handles form submission:
	 * 1. Pick the right Zod schema based on whether we are creating or editing
	 * 2. Run validation -- if it fails, show field-level error messages
	 * 3. If validation passes, call the parent's onSubmit with the clean data
	 */
	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrors({});

		try {
			// In edit mode we attach the vehicle's ID so the update schema can validate it
			const schema = mode === "edit" && initialData?.id
				? vehicleUpdateSchema
				: vehicleCreateSchema;

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
				const message = error instanceof Error ? error.message : "An error occurred";
				setErrors({ submit: message });
			}
		}
	}

	return (
		<CrudForm onSubmit={handleSubmit}>
			{/* Section 1: Required fields -- the essential info every vehicle needs */}
			<CrudFormSection 
				title="Vehicle Details" 
				description="Provide vehicle information including registration and capacity details."
			>
				<div className="grid gap-4 md:grid-cols-2">
					<CrudTextInput
						label="License Plate"
						value={formState.licensePlate}
						onChange={(value) => setFormState((prev) => ({ ...prev, licensePlate: value }))}
						error={errors.licensePlate}
						required
						placeholder="AA-12-BB"
						autoComplete="off"
					/>
					<CrudSelectInput
						label="Type"
						value={formState.type}
						onChange={(value) => setFormState((prev) => ({ ...prev, type: value as Vehicle["type"] | "" }))}
						error={errors.type}
						required
						options={VEHICLE_TYPES.map((type) => ({ value: type, label: type }))}
						placeholder="Select type"
					/>
					<CrudTextInput
						label="Brand"
						value={formState.brand}
						onChange={(value) => setFormState((prev) => ({ ...prev, brand: value }))}
						error={errors.brand}
						required
						placeholder="Mercedes"
						autoComplete="off"
					/>
					<CrudTextInput
						label="Model"
						value={formState.model}
						onChange={(value) => setFormState((prev) => ({ ...prev, model: value }))}
						error={errors.model}
						required
						placeholder="Sprinter"
						autoComplete="off"
					/>
					<CrudTextInput
						label="Color"
						value={formState.color}
						onChange={(value) => setFormState((prev) => ({ ...prev, color: value }))}
						error={errors.color}
						required
						placeholder="White"
						autoComplete="off"
					/>
					<CrudTextInput
						label="Year"
						value={formState.year}
						onChange={(value) => setFormState((prev) => ({ ...prev, year: value }))}
						error={errors.year}
						required
						type="number"
						placeholder="2022"
					/>
					<CrudTextInput
						label="Passenger Capacity"
						value={formState.passengerCapacity}
						onChange={(value) => setFormState((prev) => ({ ...prev, passengerCapacity: value }))}
						error={errors.passengerCapacity}
						required
						type="number"
						placeholder="16"
					/>
				</div>
			</CrudFormSection>

			{/* Section 2: Optional fields -- dates, service type preference, active toggle, notes */}
			<CrudFormSection
				title="Optional Details"
				description="Additional registration and assignment information."
			>
				<div className="grid gap-4 md:grid-cols-2">
					<CrudTextInput
						label="Registration Date"
						value={formState.registrationDate}
						onChange={(value) => setFormState((prev) => ({ ...prev, registrationDate: value }))}
						error={errors.registrationDate}
						type="date"
					/>
					<CrudTextInput
						label="Inspection Expiry"
						value={formState.inspectionExpiry}
						onChange={(value) => setFormState((prev) => ({ ...prev, inspectionExpiry: value }))}
						error={errors.inspectionExpiry}
						type="date"
					/>
					<CrudSelectInput
						label="Suited For"
						value={formState.suitedFor}
						onChange={(value) => setFormState((prev) => ({ ...prev, suitedFor: value as "" | (typeof SERVICE_TYPES)[number] }))}
						error={errors.suitedFor}
						options={SERVICE_TYPES.map((type) => ({ value: type, label: type }))}
						placeholder="Select service type"
					/>
					<div className="flex items-end">
						<label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
							<input
								type="checkbox"
								checked={formState.active}
								onChange={(event) => setFormState((prev) => ({ ...prev, active: event.target.checked }))}
								className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600"
							/>
							<span>Active</span>
						</label>
					</div>
				</div>

				<div className="mt-4">
					<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
						<span>Notes</span>
						<textarea
							value={formState.notes}
							onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
							placeholder="Any additional notes about this vehicle"
							rows={3}
							className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						/>
					</label>
					{errors.notes && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>}
				</div>
			</CrudFormSection>

			{/* If something unexpected goes wrong (like a network error), show it here */}
			{errors.submit && (
				<div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
					{errors.submit}
				</div>
			)}

			<CrudFormActions submitLabel={submitLabel} cancelTo={cancelTo} isSubmitting={isSubmitting} />
		</CrudForm>
	);
}



