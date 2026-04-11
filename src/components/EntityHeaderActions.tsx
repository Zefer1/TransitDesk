/**
 * Edit and Delete action buttons for entity detail pages.
 * The delete button is disabled while assignments are loading or when active assignments exist.
 */
// Header actions keep edit/delete affordances consistent and assignment-aware across entity detail pages.
type EntityHeaderActionsProps = {
	entityLabel: string;
	onEdit: () => void;
	onOpenDeleteConfirm: () => void;
	isCheckingAssignments: boolean;
	activeAssignments: number;
	assignmentCheckError?: string | null;
};

export function EntityHeaderActions({
	entityLabel,
	onEdit,
	onOpenDeleteConfirm,
	isCheckingAssignments,
	activeAssignments,
	assignmentCheckError,
}: EntityHeaderActionsProps) {
	// Delete action follows a strict guardrail order: loading -> error -> active assignments -> enabled.
	return (
		<div className="flex gap-2">
			<button
				type="button"
				onClick={onEdit}
				className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
			>
				Edit {entityLabel}
			</button>
			{isCheckingAssignments ? (
				<button
					type="button"
					disabled
					className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed"
				>
					Checking...
				</button>
			) : assignmentCheckError ? (
				<button
					type="button"
					disabled
					title="Cannot delete until assignment check succeeds"
					className="inline-flex rounded-md border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 cursor-not-allowed opacity-50"
				>
					Delete {entityLabel}
				</button>
			) : activeAssignments > 0 ? (
				<button
					type="button"
					disabled
					title={`Cannot delete: ${entityLabel.toLowerCase()} has ${activeAssignments} active service assignment(s)`}
					className="inline-flex rounded-md border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 cursor-not-allowed opacity-50"
				>
					Delete {entityLabel}
				</button>
			) : (
				<button
					type="button"
					onClick={onOpenDeleteConfirm}
					className="inline-flex rounded-md border border-red-300 dark:border-red-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20"
				>
					Delete {entityLabel}
				</button>
			)}
		</div>
	);
}



