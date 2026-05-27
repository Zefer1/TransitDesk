import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type EmptyStateAction = {
	label: string;
	to?: string;
	onClick?: () => void;
};

type EmptyStateProps = {
	title: string;
	description: string;
	action?: EmptyStateAction;
	icon?: ReactNode;
};

function DefaultEmptyIcon() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			className="h-8 w-8 text-gray-400"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
		>
			<rect x="3" y="5" width="18" height="14" rx="2" />
			<path d="M3 8h18" />
		</svg>
	);
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
	return (
		<div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-10 text-center shadow-sm">
			<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
				{icon ?? <DefaultEmptyIcon />}
			</div>
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
			<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>

			{action ? (
				action.to ? (
					<Link
						to={action.to}
						className="mt-5 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
					>
						{action.label}
					</Link>
				) : (
					<button
						type="button"
						onClick={action.onClick}
						className="mt-5 inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
					>
						{action.label}
					</button>
				)
			) : null}
		</div>
	);
}
