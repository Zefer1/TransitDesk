import type { ReactNode } from "react";

import { helpTextClassName, sectionTitleClassName } from "./serviceForm.styles";
import type { AssignmentOption } from "./serviceForm.types";

function inputClassName(hasError: boolean): string {
	return [
		"w-full rounded-md border px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition",
		hasError
			? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-100"
			: "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
	].join(" ");
}

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


