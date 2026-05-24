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

type DriverFormMode = "create" | "edit";

type DriverFormProps = {
	initialData?: Partial<Driver>;
	onSubmit: (values: ValidatedDriverCreateValues | ValidatedDriverUpdateValues) => Promise<void> | void;
	submitLabel?: string;
	isSubmitting?: boolean;
	mode?: DriverFormMode;
	cancelTo: string;
};

type DriverFormState = {
	name: string;
	gender: Driver["gender"] | "";
	license: Driver["license"] | "";
	entitledToDrive: Driver["entitledToDrive"] | "";
	phone: string;
};

type DriverFormErrors = Record<string, string>;

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

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrors({});

		try {
			const schema = mode === "edit" && initialData?.id
				? driverUpdateSchema
				: driverCreateSchema;

			const dataToValidate = mode === "edit" && initialData?.id
				? { ...formState, id: initialData.id }
				: formState;

			const validatedData = schema.parse(dataToValidate);
			await onSubmit(validatedData);
		} catch (error) {
			if (error instanceof z.ZodError) {
				setErrors(mapZodErrors(error));
			} else {
				const message = error instanceof Error ? error.message : "An error occurred";
				setErrors({ submit: message });
			}
		}
	}

	return (
		<CrudForm onSubmit={handleSubmit}>
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
