/**
 * GuideForm.tsx
 *
 * The shared form used for both creating and editing a guide. It handles:
 *   - Controlled inputs for name, gender, phone, and a dynamic list of languages
 *   - Client-side validation using the Zod schemas from guideForm.schema.ts
 *   - Displaying field-level and form-level errors
 *
 * The form works in two modes (passed via the `mode` prop):
 *   "create" -- validates with guideCreateSchema (no ID required)
 *   "edit"   -- validates with guideUpdateSchema (includes the guide's ID)
 *
 * It uses the shared CrudFormPrimitives components so all entity forms in
 * the app (vehicles, drivers, guides, etc.) have a consistent look and feel.
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
import { GENDERS } from "../../../constants/enums";
import type { Guide } from "../../../types/service.types";
import { guideCreateSchema, guideUpdateSchema } from "../schemas/guideForm.schema";
import type { ValidatedGuideCreateValues, ValidatedGuideUpdateValues } from "../schemas/guideForm.schema";

type GuideFormMode = "create" | "edit";

type GuideFormProps = {
	initialData?: Partial<Guide>;
	onSubmit: (values: ValidatedGuideCreateValues | ValidatedGuideUpdateValues) => Promise<void> | void;
	submitLabel?: string;
	isSubmitting?: boolean;
	mode?: GuideFormMode;
	cancelTo: string;
};

type GuideFormState = {
	name: string;
	gender: Guide["gender"] | "";
	phone: string;
	languages: string[];
};

type GuideFormErrors = Record<string, string>;

/**
 * Builds the starting values for the form fields.
 * If we are editing an existing guide, it fills in that guide's data.
 * If we are creating a new guide, everything starts blank.
 * It always ensures at least one empty language row so the user can type in it.
 */
function buildInitialState(initialData?: Partial<Guide>): GuideFormState {
	return {
		name: initialData?.name ?? "",
		gender: initialData?.gender ?? "",
		phone: initialData?.phone ?? "",
		languages: initialData?.languages && initialData.languages.length > 0 ? initialData.languages : [""],
	};
}


export function GuideForm({
	initialData,
	onSubmit,
	submitLabel = "Save Guide",
	isSubmitting = false,
	mode = "create",
	cancelTo,
}: GuideFormProps) {
	const [formState, setFormState] = useState<GuideFormState>(buildInitialState(initialData));
	const [errors, setErrors] = useState<GuideFormErrors>({});

	// --- Language list helpers ---
	// Languages are stored as an array of strings in the form state.
	// These three functions let the user add, remove, or edit individual entries.
	const addLanguage = () => {
		setFormState((current) => ({ ...current, languages: [...current.languages, ""] }));
	};

	const removeLanguage = (index: number) => {
		setFormState((current) => ({
			...current,
			languages: current.languages.filter((_, i) => i !== index),
		}));
	};

	const updateLanguage = (index: number, value: string) => {
		setFormState((current) => {
			const updated = [...current.languages];
			updated[index] = value;
			return { ...current, languages: updated };
		});
	};

	/**
	 * Called when the user clicks the submit button.
	 * 1. Prevents the default browser form submission (which would reload the page)
	 * 2. Picks the right Zod schema based on create vs. edit mode
	 * 3. Validates the form data -- if validation fails, shows errors on the fields
	 * 4. If validation passes, calls the onSubmit callback provided by the parent page
	 */
	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrors({});

		try {
			const schema = mode === "edit" && initialData?.id ? guideUpdateSchema : guideCreateSchema;

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
			{/* Primary identity and contact fields used by assignment selectors. */}
			<CrudFormSection
				title="Guide Details"
				description="Provide guide information including contact details and language coverage."
			>
				<div className="grid gap-4 md:grid-cols-2">
					<CrudTextInput
						label="Full Name"
						value={formState.name}
						onChange={(value) => setFormState((current) => ({ ...current, name: value }))}
						error={errors.name}
						required
						autoComplete="name"
						placeholder="Maria Santos"
						disabled={isSubmitting}
					/>

					<CrudSelectInput
						label="Gender"
						value={formState.gender}
						onChange={(value) =>
							setFormState((current) => ({ ...current, gender: value as Guide["gender"] | "" }))
						}
						error={errors.gender}
						required
						options={GENDERS.map((g) => ({ value: g, label: g }))}
						placeholder="Select gender"
						disabled={isSubmitting}
					/>

					<CrudTextInput
						label="Phone"
						value={formState.phone}
						onChange={(value) => setFormState((current) => ({ ...current, phone: value }))}
						error={errors.phone}
						type="tel"
						autoComplete="tel"
						placeholder="+351 910 000 000"
						disabled={isSubmitting}
					/>
				</div>
			</CrudFormSection>

			{/* Language capability is managed as a dynamic list in the same payload. */}
			<CrudFormSection
				title="Languages"
				description="Add the languages this guide can conduct tours in. At least one is required."
			>
				<div className="space-y-3">
					{formState.languages.map((lang, index) => (
						<div key={index} className="flex items-start gap-2">
							<div className="flex-1">
								<CrudTextInput
									label={`Language ${index + 1}`}
									value={lang}
									onChange={(value) => updateLanguage(index, value)}
									error={errors[`languages.${index}`] ?? (index === 0 ? errors.languages : undefined)}
									placeholder="e.g. English"
									disabled={isSubmitting}
								/>
							</div>
							{formState.languages.length > 1 && (
								<button
									type="button"
									onClick={() => removeLanguage(index)}
									disabled={isSubmitting}
									aria-label={`Remove language ${index + 1}`}
									className="mt-7 rounded-md border border-red-200 dark:border-red-800 px-2 py-2 text-sm text-red-600 dark:text-red-400 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									✕
								</button>
							)}
						</div>
					))}

					<button
						type="button"
						onClick={addLanguage}
						disabled={isSubmitting}
						className="mt-1 rounded-md border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						+ Add language
					</button>
				</div>
			</CrudFormSection>

			{/* Form-level API/unknown errors are surfaced below sections. */}
			{errors.submit && (
				<div
					className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400"
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



