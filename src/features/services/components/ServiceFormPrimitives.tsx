/**
 * ServiceFormPrimitives.tsx
 *
 * Reusable, low-level form building blocks used by ServiceFormSections.
 * Each primitive handles one common input pattern (text field, dropdown, textarea, etc.)
 * and takes care of styling, error display, and accessibility labels.
 *
 * These components do NOT know anything about services or business logic --
 * they are generic input wrappers that could be used in any form.
 * The service-specific sections (ServiceFormSections.tsx) compose these primitives
 * and wire them up to the actual form state.
 */
import type { ReactNode } from "react";

import { helpTextClassName, sectionTitleClassName } from "./serviceForm.styles";
import type { AssignmentOption } from "./serviceForm.types";

/**
 * Returns the appropriate Tailwind classes for an input field.
 * Shows a red border when there is a validation error, blue border when focused normally.
 */
function inputClassName(hasError: boolean): string {
	return [
		"w-full rounded-md border px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition",
		hasError
			? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-100"
			: "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
	].join(" ");
}

/**
 * A card wrapper that groups related fields together with a title and description.
 * Each major section of the form (Service details, Vehicle, Driver, Guide) is
 * wrapped in one of these.
 */
export function Section({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: ReactNode;
}) {
	return (
		<section className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800 p-5">
			<div>
				<h3 className={sectionTitleClassName()}>{title}</h3>
				<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
			</div>
			{children}
		</section>
	);
}

// Small helper that shows a red error message below a field (only when there is one).
function FieldError({ message }: { message?: string }) {
	if (!message) {
		return null;
	}

	return <p className="text-sm text-red-600 dark:text-red-400">{message}</p>;
}

export function TextInput({
	label,
	value,
	onChange,
	error,
	type = "text",
	placeholder,
	disabled = false,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	type?: "text" | "number" | "datetime-local" | "date" | "tel";
	placeholder?: string;
	disabled?: boolean;
}) {
	// Standard single-line input. Works for text, numbers, dates, and phone numbers
	// depending on the "type" prop passed in.
	return (
		<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
			<span>{label}</span>
			<input
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				disabled={disabled}
				className={inputClassName(Boolean(error))}
			/>
			<FieldError message={error} />
		</label>
	);
}

export function SelectInput({
	label,
	value,
	onChange,
	options,
	error,
	placeholder,
	disabled = false,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: readonly string[];
	error?: string;
	placeholder: string;
	disabled?: boolean;
}) {
	// Dropdown for picking from a fixed list of string values (like service type or gender).
	return (
		<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
			<span>{label}</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				disabled={disabled}
				className={inputClassName(Boolean(error))}
			>
				<option value="">{placeholder}</option>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
			<FieldError message={error} />
		</label>
	);
}

export function TextAreaInput({
	label,
	value,
	onChange,
	error,
	rows = 4,
	placeholder,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	rows?: number;
	placeholder?: string;
}) {
	// Multi-line text area for longer content like notes or descriptions.
	return (
		<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
			<span>{label}</span>
			<textarea
				value={value}
				onChange={(event) => onChange(event.target.value)}
				rows={rows}
				placeholder={placeholder}
				className={inputClassName(Boolean(error))}
			/>
			<FieldError message={error} />
		</label>
	);
}

export function AssignmentSelectInput({
	label,
	value,
	onChange,
	options,
	error,
	placeholder,
	disabled = false,
	helpText,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: AssignmentOption[];
	error?: string;
	placeholder: string;
	disabled?: boolean;
	helpText?: string;
}) {
	// Specialized dropdown for picking an entity (vehicle, driver, or guide).
	// Unlike SelectInput, this uses { value, label } option objects and supports
	// an optional help text hint below the dropdown.
	return (
		<label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
			<span>{label}</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				disabled={disabled}
				className={inputClassName(Boolean(error))}
			>
				<option value="">{placeholder}</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{helpText ? <p className={helpTextClassName()}>{helpText}</p> : null}
			<FieldError message={error} />
		</label>
	);
}


