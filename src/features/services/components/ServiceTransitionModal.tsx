import { useState } from "react";
import type { ServiceStatus } from "../../../types/service.types";

interface ServiceTransitionModalProps {
	pendingTransition: ServiceStatus;
	currentStatus: ServiceStatus;
	isTransitioning: boolean;
	transitionError: string | null;
	onConfirm: (cancellationReason: string) => Promise<void>;
	onClose: () => void;
}

export function ServiceTransitionModal({
	pendingTransition,
	currentStatus,
	isTransitioning,
	transitionError,
	onConfirm,
	onClose,
}: ServiceTransitionModalProps) {
	const [cancellationReason, setCancellationReason] = useState("");

	const handleConfirm = async () => {
		await onConfirm(cancellationReason);
	};

	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-950/50 px-4">
			<div
				className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl"
				role="dialog"
				aria-modal="true"
				aria-labelledby="status-transition-title"
			>
				<h3 id="status-transition-title" className="text-lg font-semibold text-gray-900 dark:text-white">
					Confirm status change
				</h3>
				<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
					You are changing this service from {currentStatus} to {pendingTransition}.
				</p>

				{pendingTransition === "cancelled" ? (
					<label className="mt-4 flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
						<span>Cancellation reason</span>
						<textarea
							value={cancellationReason}
							onChange={(event) => setCancellationReason(event.target.value)}
							rows={4}
							placeholder="Required reason for cancellation"
							className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						/>
					</label>
				) : null}

				{transitionError ? (
					<div className="mt-4 rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
						{transitionError}
					</div>
				) : null}

				<div className="mt-6 flex flex-wrap justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						disabled={isTransitioning}
						className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Keep current status
					</button>
					<button
						type="button"
						onClick={handleConfirm}
						disabled={isTransitioning}
						className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isTransitioning ? "Updating..." : "Confirm transition"}
					</button>
				</div>
			</div>
		</div>
	);
}



