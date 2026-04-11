/**
 * Reusable form building blocks for CRUD (Create, Read, Update, Delete) forms.
 *
 * Instead of writing raw <input>, <select>, and <textarea> elements every time
 * you build a form, you use these components. They handle a lot of things for you:
 *
 *  - Each input gets a unique ID automatically (via React's useId hook), so you
 *    never have to come up with IDs yourself.
 *  - Accessibility is built in: screen readers are told when a field is invalid,
 *    and hint/error messages are linked to inputs via aria-describedby.
 *  - Error styling (red borders) and normal styling (blue focus ring) are
 *    applied consistently through the shared `inputClassName` helper.
 *
 * Components exported from this file:
 *  - CrudForm           -- the <form> wrapper (disables native browser validation)
 *  - CrudFormSection    -- a titled card that groups related fields together
 *  - CrudTextInput      -- a text/number/date/tel input with label, hint, and error
 *  - CrudSelectInput    -- a dropdown select with the same label/hint/error pattern
 *  - CrudTextAreaInput  -- a multi-line text area with the same pattern
 *  - CrudFormActions    -- Submit and Cancel buttons at the bottom of the form
 */
import { useId } from "react";
import { Link } from "react-router-dom";

/**
 * Returns the right CSS classes for an input's border color.
 * If there is a validation error, the border turns red; otherwise it is gray
 * with a blue ring when focused.
 */
function inputClassName(hasError: boolean): string {
	return [
		"w-full rounded-md border px-3 py-2 text-sm text-gray-900 dark:text-white shadow-sm outline-none transition dark:bg-gray-800",
		hasError
			? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-100"
			: "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800",
	].join(" ");
}

/**
 * Builds the value for the aria-describedby attribute by joining the hint and
 * error element IDs. Screen readers use this to announce extra info about a field.
 */
function describedBy(hintId?: string, errorId?: string): string | undefined {
	const ids = [hintId, errorId].filter(Boolean);
	return ids.length > 0 ? ids.join(" ") : undefined;
}

type CrudFormProps = {
	children: React.ReactNode;
	onSubmit: React.SubmitEventHandler<HTMLFormElement>;
	className?: string;
};

export function CrudForm({ children, onSubmit, className = "space-y-6" }: CrudFormProps) {
	return (
		<form onSubmit={onSubmit} className={className} noValidate>
			{children}
		</form>
	);
}

type CrudFormSectionProps = {
	title: string;
	description?: string;
	children: React.ReactNode;
};

export function CrudFormSection({ title, description, children }: CrudFormSectionProps) {
	return (
		<section className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
			<div>
				<h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
				{description ? <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p> : null}
			</div>
			{children}
		</section>
	);
}

type CrudTextInputProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	hint?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	type?: "text" | "number" | "date" | "datetime-local" | "tel" | "search";
	autoComplete?: string;
};

export function CrudTextInput({
	label,
	value,
	onChange,
	error,
	hint,
	placeholder,
	required = false,
	disabled = false,
	type = "text",
	autoComplete,
}: CrudTextInputProps) {
	const id = useId();
	const hintId = hint ? `${id}-hint` : undefined;
	const errorId = error ? `${id}-error` : undefined;

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
				{label}
				{required ? <span className="ml-1 text-red-600 dark:text-red-400">*</span> : null}
			</label>
			<input
				id={id}
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				required={required}
				disabled={disabled}
				autoComplete={autoComplete}
				aria-invalid={Boolean(error)}
				aria-describedby={describedBy(hintId, errorId)}
				className={inputClassName(Boolean(error))}
			/>
			{hint ? (
				<p id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
					{hint}
				</p>
			) : null}
			{error ? (
				<p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
					{error}
				</p>
			) : null}
		</div>
	);
}

type CrudSelectOption = {
	label: string;
	value: string;
};

type CrudSelectInputProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: readonly CrudSelectOption[];
	placeholder?: string;
	error?: string;
	hint?: string;
	required?: boolean;
	disabled?: boolean;
};

export function CrudSelectInput({
	label,
	value,
	onChange,
	options,
	placeholder = "Select an option",
	error,
	hint,
	required = false,
	disabled = false,
}: CrudSelectInputProps) {
	const id = useId();
	const hintId = hint ? `${id}-hint` : undefined;
	const errorId = error ? `${id}-error` : undefined;

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
				{label}
				{required ? <span className="ml-1 text-red-600 dark:text-red-400">*</span> : null}
			</label>
			<select
				id={id}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				required={required}
				disabled={disabled}
				aria-invalid={Boolean(error)}
				aria-describedby={describedBy(hintId, errorId)}
				className={inputClassName(Boolean(error))}
			>
				<option value="">{placeholder}</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			{hint ? (
				<p id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
					{hint}
				</p>
			) : null}
			{error ? (
				<p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
					{error}
				</p>
			) : null}
		</div>
	);
}

type CrudTextAreaInputProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	hint?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	rows?: number;
};

export function CrudTextAreaInput({
	label,
	value,
	onChange,
	error,
	hint,
	placeholder,
	required = false,
	disabled = false,
	rows = 4,
}: CrudTextAreaInputProps) {
	const id = useId();
	const hintId = hint ? `${id}-hint` : undefined;
	const errorId = error ? `${id}-error` : undefined;

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
				{label}
				{required ? <span className="ml-1 text-red-600 dark:text-red-400">*</span> : null}
			</label>
			<textarea
				id={id}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				required={required}
				disabled={disabled}
				rows={rows}
				aria-invalid={Boolean(error)}
				aria-describedby={describedBy(hintId, errorId)}
				className={inputClassName(Boolean(error))}
			/>
			{hint ? (
				<p id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
					{hint}
				</p>
			) : null}
			{error ? (
				<p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
					{error}
				</p>
			) : null}
		</div>
	);
}

type CrudFormActionsProps = {
	submitLabel: string;
	isSubmitting?: boolean;
	isSubmitDisabled?: boolean;
	cancelLabel?: string;
	cancelTo?: string;
	onCancel?: () => void;
};

export function CrudFormActions({
	submitLabel,
	isSubmitting = false,
	isSubmitDisabled = false,
	cancelLabel = "Cancel",
	cancelTo,
	onCancel,
}: CrudFormActionsProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<button
				type="submit"
				disabled={isSubmitting || isSubmitDisabled}
				className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
			>
				{isSubmitting ? "Saving..." : submitLabel}
			</button>
			{cancelTo ? (
				<Link
					to={cancelTo}
					className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
				>
					{cancelLabel}
				</Link>
			) : (
				<button
					type="button"
					onClick={onCancel}
					className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
				>
					{cancelLabel}
				</button>
			)}
		</div>
	);
}



