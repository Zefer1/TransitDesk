/** Shared page layout for edit views. Renders a title, description, and a white card wrapper. */
import type { ReactNode } from "react";

// Core flow note: the block below contains the main behavior used by this module.

// Provides a consistent edit-page shell so feature forms share the same visual structure.

type EditSectionLayoutProps = {
	title: string;
	description: string;
	children: ReactNode;
};

export function EditSectionLayout({ title, description, children }: EditSectionLayoutProps) {
	return (
		<section className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
				<p className="text-gray-600 dark:text-gray-400">{description}</p>
			</div>

			<div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
				{children}
			</div>
		</section>
	);
}



