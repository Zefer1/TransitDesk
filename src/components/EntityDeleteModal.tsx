type EntityDeleteModalProps = {
	isOpen: boolean;
	entityLabel: string;
	entityName: string;
	activeAssignments: number;
	assignmentCheckError?: string | null;
	isDeleting: boolean;
	onCancel: () => void;
	onConfirm: () => void;
};

export function EntityDeleteModal({
	isOpen,
	entityLabel,
	entityName,
	activeAssignments,
	assignmentCheckError,
	isDeleting,
	onCancel,
	onConfirm,
}: EntityDeleteModalProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-950/50 px-4">
			<div
				className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl"
				role="dialog"
				aria-modal="true"
				aria-labelledby="delete-confirm-title"
			>
				<h3 id="delete-confirm-title" className="text-lg font-semibold text-gray-900 dark:text-white">
					Delete {entityLabel}
				</h3>
				<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
					Are you sure you want to delete <strong>{entityName}</strong>? This action cannot be undone.
				</p>

				{activeAssignments > 0 ? (
					<div className="mt-4 rounded-md border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
						<p className="font-medium">This {entityLabel.toLowerCase()} has {activeAssignments} active service assignment(s).</p>
						<p>Please reassign or complete these services before deleting.</p>
					</div>
				) : null}

				{assignmentCheckError ? (
					<div className="mt-4 rounded-md border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
						<p className="font-medium">Assignment verification is currently unavailable.</p>
						<p>Please try again after reloading this page.</p>
					</div>
				) : null}

				<div className="mt-6 flex flex-wrap justify-end gap-2">
					<button
						type="button"
						autoFocus
						onClick={onCancel}
						disabled={isDeleting}
						className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isDeleting || activeAssignments > 0 || Boolean(assignmentCheckError)}
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isDeleting ? "Deleting..." : `Delete ${entityLabel}`}
					</button>
				</div>
			</div>
		</div>
	);
}
