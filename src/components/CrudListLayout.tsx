/**
 * Reusable list page layout for CRUD modules (Services, Drivers, Vehicles, Guides).
 *
 * Every list page in the app needs to handle the same set of states:
 *  - Loading: show skeleton placeholders while data is being fetched
 *  - Error: show an error message with an optional "Retry" button
 *  - Empty: show a friendly message when there are no items to display
 *  - Normal: show the page header, optional filter bar, and the data table/cards
 *
 * This component handles all of that so each feature page only needs to pass in
 * its data and configuration, rather than re-implementing loading/error/empty UI.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "./EmptyState";
import { SkeletonCardRows, SkeletonTableRows } from "./Skeleton";

type CrudListAction = {
	label: string;
	to: string;
};

type CrudListEmptyState = {
	title: string;
	description: string;
	action?: {
		label: string;
		to?: string;
		onClick?: () => void;
	};
};

type CrudListLayoutProps = {
	title: string;
	description: string;
	primaryAction?: CrudListAction;
	filters?: ReactNode;
	children?: ReactNode;
	isLoading?: boolean;
	errorMessage?: string | null;
	onRetry?: () => void;
	isEmpty?: boolean;
	emptyState?: CrudListEmptyState;
	loadingLabel?: string;
};

/**
 * The skeleton that appears while data is loading. Shows card skeletons on
 * mobile and a table skeleton on larger screens (responsive design).
 */
function DefaultLoadingBlock() {
	return (
		<>
			<div className="grid gap-4 md:hidden">
				<SkeletonCardRows rows={4} />
			</div>
			<div className="hidden overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow md:block">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-900">
						<tr>
							<th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Name</th>
							<th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Type</th>
							<th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Status</th>
							<th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Meta</th>
							<th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
						<SkeletonTableRows rows={4} />
					</tbody>
				</table>
			</div>
		</>
	);
}

export function CrudListLayout({
	title,
	description,
	primaryAction,
	filters,
	children,
	isLoading = false,
	errorMessage,
	onRetry,
	isEmpty = false,
	emptyState,
	loadingLabel = "Loading items",
}: CrudListLayoutProps) {
	if (isLoading) {
		return (
			<section className="space-y-6" aria-busy="true" aria-live="polite">
				<span className="sr-only">{loadingLabel}</span>
				<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
				</div>
				<DefaultLoadingBlock />
			</section>
		);
	}

	if (errorMessage) {
		return (
			<section className="space-y-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow-sm">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
				<p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
				{onRetry ? (
					<div>
						<button
							type="button"
							onClick={onRetry}
							className="rounded-md border border-red-300 dark:border-red-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 transition hover:bg-red-100 dark:hover:bg-red-900/30"
						>
							Retry
						</button>
					</div>
				) : null}
			</section>
		);
	}

	return (
		<section className="space-y-6">
			<div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
				</div>

				{primaryAction ? (
					<Link
						to={primaryAction.to}
						className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto"
					>
						{primaryAction.label}
					</Link>
				) : null}
			</div>

			{filters ? (
				<div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">{filters}</div>
			) : null}

			{isEmpty && emptyState ? (
				<EmptyState
					title={emptyState.title}
					description={emptyState.description}
					action={emptyState.action}
				/>
			) : (
				children
			)}
		</section>
	);
}



