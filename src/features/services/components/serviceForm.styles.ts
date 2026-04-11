/**
 * serviceForm.styles.ts
 *
 * Shared Tailwind class-name helpers for the service form.
 * Instead of copy-pasting the same class strings in every section,
 * we define them here once and import them wherever needed.
 * This keeps the visual style of headings and help text consistent
 * across all form sections.
 */

// Returns the classes for section headings (e.g. "Stops", "Languages").
export function sectionTitleClassName(): string {
	return "text-base font-semibold text-gray-900 dark:text-white";
}

// Returns the classes for small helper/hint text below fields and headings.
export function helpTextClassName(): string {
	return "text-xs text-gray-500 dark:text-gray-400";
}



